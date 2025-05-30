import { asyncHandler } from "../utils/asyncHandler";
import jwt, {Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { User, IUser } from "../models/user";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    const token: string | undefined = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log("req.cookies:", req.cookies);
    console.log("Authorization header:", req.header("Authorization"));
    console.log(token);
    if(!token){
      res.status(401).json({
          success: false,
          message: `Unauthorized access`,
      })
      return;
    }
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if(!secret){
      res.status(401).json({
          success: false,
          message: `Unauthorized access`,
      })
      return;
    }
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    const userId = decodedToken._id;

    let user = await User.findById(userId).select("-password -refreshToken");
    if(!user){
        res.status(400).json({
            success: false,
            message: "Invalid Access Token"
        })
    }

    (req as any).user = user;
    next();
})