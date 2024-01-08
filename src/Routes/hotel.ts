import express from "express";
import { getDataById, getHotel, getHotelBookingById, payment, searchHotel } from "../Controller/hotelController";
import { verifyToken } from "../Controller/userController";
import { hotelBooking } from "../Controller/bookingController";

const Router = express();

Router.get("/search", searchHotel);
Router.get("/:id", getDataById);
Router.post("/:hotelId/bookings", verifyToken, getHotelBookingById);
Router.post("/:hotelId/booking/payment", verifyToken, payment);
Router.get("/booking", verifyToken, hotelBooking);
Router.get("/",  getHotel);


export default Router;