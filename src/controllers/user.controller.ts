import { asyncHandler } from "../utils/asyncHandler";
import { User, IUser } from "../models/user";
import { Property, IProperty } from "../models/property";
import mongoose, { SaveOptions, HydratedDocument,Types } from "mongoose";
import { CookieOptions } from "express";
import jwt from "jsonwebtoken"

const createAccessAndRefreshTokens = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId) as HydratedDocument<IUser> | null;

  if (!user) {
    throw new Error("User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  // const options: SaveOptions = { validateBeforeSave: false as any};
  await user.save({ validateBeforeSave: false as any});

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password, role} = req.body;
    if(!name || !email || !password || !role){
      res.status(400).json({
        success: false,
        message: "All the fields are required!",
      });
      return;
    }

    const user = await User.create({
      name, email, password, role
    });

    if(!user){
      res.status(400).json({
        success: false,
        message: "Error registering user!",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
      res.status(400).json({
        success: false,
        message: "Both email and password are required!",
      });
      return;
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
      res.status(400).json({
        success: false,
        message: "User not found!",
      });
      return;
    }

    if(user.password !== password){
      res.status(400).json({
        success: false,
        message: "Invalid password!",
      });
      return;
    }

    const {accessToken, refreshToken} = await createAccessAndRefreshTokens(user._id);
    const options: CookieOptions = {
      httpOnly : true,
      secure : true,
      sameSite: "none",
    }

    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message: "User logged in successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        (req as any).user._id,
        {
            $unset : {refreshToken : 1}
        },
        {
            new : true
        }
    )

    const options: CookieOptions = {
      httpOnly : true,
      secure : true,
      sameSite: "none",
    }

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
        success: true,
        message: "User logged out successfully!",
    });
});

const getCurrentUser = asyncHandler(async(req, res) => {
    res.status(200)
    .json({
        success: true,
        message: "User logged out successfully!",
        user : (req as any).user
    })
})

const addFavorite = asyncHandler(async (req, res) => {
    const user = (req as any).user;
    const propertyId = req.params.propertyId;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.favorites.includes(propertyId)) {
      res.status(400).json({ message: "Property already in favorites" });
      return;
    }

    const property = await Property.findById(propertyId);
    user.favorites.push(property);
    await user.save();

    res.status(200).json({ message: "Property added to favorites", favorites: user.favorites });
});

const getFavorites = asyncHandler(async (req, res) => {
    let userId: string | null = (req as any).user._id;

    const user = await User.findById(userId).populate("favorites");

    if (!user){
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ favorites: user.favorites });
});

const removeFavorite = asyncHandler(async (req, res) => {
  let userId: string | null = (req as any).user._id;
  const propertyId = req.params.propertyId;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.favorites = user.favorites.filter(fav => (fav as any)._id.toString() !== propertyId);
  await user.save();

  res.status(200).json({ message: "Property removed from favorites", favorites: user.favorites });
});

const recommendProperty = asyncHandler(async (req, res) => {
  const {email, propertyId} = req.body;
  if(!email || !propertyId){
    res.status(400).json({
      success: false,
      message: "Email and property ID are required!",
    });
    return;
  }

  const user = await User.findOne({email});
  if(!user){
    res.status(404).json({
      success: false,
      message: "User not found!",
    });
    return;
  }
  const property = await Property.findById(propertyId) as IProperty;
  if(!property){
    res.status(404).json({
      success: false,
      message: "User not found!",
    });
    return;
  }
  if (user.recommendations.includes(property)) {
    res.status(400).json({ message: "Property already in recommendations" });
    return;
  }
  user.recommendations.push(property);
  await user.save();

  res.status(200).json({ message: "Property added to user's recommendations!", Users_recommendations: user.recommendations });
});

const addProperty = asyncHandler(async (req, res) => {
    const {
    id,
    title,
    type,
    price,
    state,
    city,
    areaSqFt,
    bedrooms,
    bathrooms,
    amenities,
    furnished,
    availableFrom,
    tags,
    colorTheme,
    rating,
    isVerified,
    listingType
  } = req.body;

  const user = (req as any).user;
  const newProperty = await Property.create({
    id,
    title,
    type,
    price,
    state,
    city,
    areaSqFt,
    bedrooms,
    bathrooms,
    amenities,
    furnished,
    availableFrom,
    listedBy : user.role,
    tags,
    colorTheme,
    rating,
    isVerified,
    listingType
  });

  if(!newProperty){
    res.status(400).json({
      success: false,
      message: "Failed to add Property"
    })
    return;
  }

  res.status(200).json({
    success : true,
    message: "Property added successfully!",
    newProperty : newProperty
  })
});

const updateProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const updateData = req.body;

  const property = await Property.findById(propertyId);
  if(!property){
    res.status(404).json({
      success: false,
      message: "Property not found",
    });
    return;
  }
  if(property.listedBy !== (req as any).user.role){
    res.status(404).json({
      success: false,
      message: "You are not authorized to update this property",
    });
    return;
  }

  const updatedProperty = await Property.findByIdAndUpdate(propertyId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedProperty) {
    res.status(404).json({
      success: false,
      message: "Property not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    property: updatedProperty,
  });
})

const deleteProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const user = (req as any).user;
  const property = await Property.findById(propertyId);
  if(!property){
    res.status(404).json({
      success: false,
      message: "Property not found",
    });
    return;
  }

  if(property.listedBy !== user.role){
    res.status(404).json({
      success: false,
      message: "You are not authorized to delete this property",
    });
    return;
  }

  await Property.findByIdAndDelete(propertyId);

  res.status(200).json({
    success: true,
    message: "Property deleted successfully",
  });
})

export {registerUser, loginUser, logoutUser, addFavorite, getFavorites, removeFavorite, getCurrentUser, recommendProperty, addProperty, updateProperty, deleteProperty};