import mongoose, {Schema, Types} from "mongoose";
import jwt, {Secret, SignOptions} from "jsonwebtoken";
import { IProperty } from "./property";

export interface IUser extends Document {
  _id: Types.ObjectId,
  name: string;
  email: string;
  password: string;
  role: string;
  favorites: IProperty[];
  recommendations: IProperty[];
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
  refreshToken : string;
}

const userSchema = new Schema<IUser>({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  role: {type: String, required: true},
  favorites: [{ type: [] }],
  recommendations: [{ type: []}],
  refreshToken: { type: String, default: "" },
});

userSchema.methods.generateAccessToken = function (this: IUser): string {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error("ACCESS_TOKEN_SECRET or ACCESS_TOKEN_EXPIRY is not defined");
  }

  const secret: Secret = process.env.ACCESS_TOKEN_SECRET;
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"];

  const payload = {
    _id: this._id.toString(),
    email: this.email,
    name: this.name,
  };

  const options: SignOptions = {
    expiresIn: expiresIn,
  };

  return jwt.sign(payload, secret, options);
};

userSchema.methods.generateRefreshToken = function (this: IUser): string {
  const secret = process.env.REFRESH_TOKEN_SECRET as Secret;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"];

  const payload = {
    _id: this._id.toString(),
  };

  const options: SignOptions = {
    expiresIn: expiresIn,
  };

  return jwt.sign(payload, secret, options);
};


export const User = mongoose.model<IUser>("User", userSchema);