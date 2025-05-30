import { Property } from "../models/property";
import { asyncHandler } from "../utils/asyncHandler";
import {redisClient} from "../utils/redis";

const fetchProperties = asyncHandler(async (req, res) => {
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
    listedBy,
    tags,
    colorTheme,
    rating,
    isVerified,
    listingType
  } = req.query;

  const filter : any = {};

  if(id) filter.id = id;
  if(title) filter.title = title;
  if(type) filter.type = type;
  if(price){
    const priceRange = (price as string).split("-");
    if(priceRange.length === 2) {
      const minPrice = parseFloat(priceRange[0]);
      const maxPrice = parseFloat(priceRange[1]);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        filter.price = { $gte: minPrice, $lte: maxPrice };
      }
    }
    else {
      const singlePrice = parseFloat(price as string);
      if (!isNaN(singlePrice)) filter.price = singlePrice;
    }
  }
  if(state) filter.state = state;
  if(city){
    filter.city = { $regex: new RegExp(`^${city}$`, "i") };
  }
  if(areaSqFt) filter.areaSqFt = areaSqFt;
  if(bedrooms) filter.bedrooms = bedrooms;
  if(bathrooms) filter.bathrooms = bathrooms;
  if(amenities){
    const amenitiesArray = (amenities as string).split("|");
    filter.$and = amenitiesArray.map(item => ({
      amenities: { $regex: new RegExp(`\\b${item}\\b`, "i") }
    }));
  }
  if(furnished) filter.furnished = furnished;
  if(listedBy) filter.listedBy = listedBy;
  if(colorTheme) filter.listedBy = colorTheme;
  if(isVerified) filter.isVerified = isVerified;
  if(listingType) filter.listingType = listingType;
  if(availableFrom){
    const date = new Date(availableFrom as string);
    if (!isNaN(date.getTime())) filter.availableFrom = { $gte: date };
  }
  if(tags){
    const tagsArray = (tags as string).split("|");
    filter.$and = tagsArray.map(item => ({
      tags: { $regex: new RegExp(`\\b${item}\\b`, "i") }
    }));
  }
  if(rating){
    const minRating = parseFloat(rating as string);
    if (!isNaN(minRating)) {
      filter.rating = { $gte: minRating };
    }
  }

  // getting data from Redis
  const redisKey = `properties:${JSON.stringify(req.query)}`;
  const cachedData = await redisClient.get(redisKey);

  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    res.status(200).json({
      message: "Properties fetched from cache.",
      success: true,
      properties: parsed,
    });
    return;
  }
  else{

  }

  const properties = await Property.find(filter).limit(10);
  if (!properties) {
    res.status(400).json({
      message: "Error getting properties.",
      success: false,
    })
    return;
  }

  await redisClient.set(redisKey, JSON.stringify(properties), {
    EX: 300,
  });

  res.status(200).json({
    message: "Properties fetched successfully.",
    success: true,
    properties,
  })
  return;
})

export { fetchProperties };