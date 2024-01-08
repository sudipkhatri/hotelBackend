import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./Routes/userRoutes";
import authRouter from "./Routes/auth";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import hotelRouter from "./Routes/myHotel";
import Router from "../src/Routes/hotel"
import bookingRouter from "./Routes/booking";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log(
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   })
// );

mongoose.connect(process.env.DB_URL as string)
const app = express();
// .then(() => {
//     console.log("connected to database.", process.env.DB_URL);
// }); //cast this to string as it is typescipt

//app.use(express.static(path.join(__dirname, "../../frontend/disc")))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL, //only accept access from this url
    credentials: true,
  })
);

app.use("/api/my-hotels", hotelRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);
app.use("/api/hotels", Router);
app.use("/api/mybookings", bookingRouter);


const port = 5001; //|| 4000

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`);
});
