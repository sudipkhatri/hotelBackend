"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hotelController_1 = require("../Controller/hotelController");
const userController_1 = require("../Controller/userController");
const bookingController_1 = require("../Controller/bookingController");
const Router = (0, express_1.default)();
Router.get("/search", hotelController_1.searchHotel);
Router.get("/:id", hotelController_1.getDataById);
Router.post("/:hotelId/bookings", userController_1.verifyToken, hotelController_1.getHotelBookingById);
Router.post("/:hotelId/booking/payment", userController_1.verifyToken, hotelController_1.payment);
Router.get("/booking", userController_1.verifyToken, bookingController_1.hotelBooking);
Router.get("/", hotelController_1.getHotel);
exports.default = Router;
