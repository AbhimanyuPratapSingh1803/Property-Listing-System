import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './db/db';
import {connectRedis} from './utils/redis';
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}))

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port : ${process.env.PORT}`);
})
app.get("/", (req, res) => {
  res.json("Hello Welcome to Property Listing System!!!");
});

connectRedis()
.then(() => {
    console.log("Redis Connected");
})
.catch((error) => {
    console.log("Redis connection failed : ", error);
})
connectDB()
.then(() => {
    console.log("MongoDB Connected");
})
.catch((error) => {
    console.log("MongoDB connection failed : ", error);
})

app.use(express.json({limit : "16kb"}));
app.use(cookieParser());
app.use(express.urlencoded({extended : true, limit : "16kb"}));
app.use(express.static("public"));

import propertRouter from "./routes/property.router";
import userRouter from "./routes/user.router";
app.use("/property", propertRouter);
app.use("/user", userRouter);