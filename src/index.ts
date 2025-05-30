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

connectRedis()
.then(() => {
    // app.listen(process.env.PORT || 8000, () => {
    //     console.log(`Redis connected and Server is listening on port : ${process.env.PORT}`);
    // })
})
.catch((error) => {
    console.log("Redis connection failed : ", error);
})
connectDB()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection failed : ", error);
})
app.get("/", (req, res) => {
  res.json("Hello Welcome to Property Listing System!!!");
});

app.use(express.json({limit : "16kb"}));
app.use(cookieParser());
app.use(express.urlencoded({extended : true, limit : "16kb"}));
app.use(express.static("public"));

import propertRouter from "./routes/property.router";
import userRouter from "./routes/user.router";
app.use("/property", propertRouter);
app.use("/user", userRouter);