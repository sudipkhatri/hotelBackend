import express from "express";
import multer from "multer";
import { verifyToken } from "../Controller/userController";
import { getMyHotel, getHotelById, updateHotel, uploadData } from "../Controller/hotelController";
import { body } from "express-validator";

const hotelRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

hotelRouter.post(
  "/add",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("pricePerNight").notEmpty().isNumeric().withMessage("Price per night is required and must be a number"),
    body("facilities").notEmpty().isArray().withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6), //use the same name in the frontend
  uploadData
);

hotelRouter.get("/", verifyToken, getMyHotel);
hotelRouter.put("/:hotelId", verifyToken, upload.array("imageFiles"),  updateHotel);
hotelRouter.get("/:id", verifyToken, getHotelById);

export default hotelRouter;
