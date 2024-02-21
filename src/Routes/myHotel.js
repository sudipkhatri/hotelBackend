"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const userController_1 = require("../Controller/userController");
const hotelController_1 = require("../Controller/hotelController");
const express_validator_1 = require("express-validator");
const hotelRouter = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
hotelRouter.post("/add", userController_1.verifyToken, [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("city").notEmpty().withMessage("City is required"),
    (0, express_validator_1.body)("country").notEmpty().withMessage("Country is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("Description is required"),
    (0, express_validator_1.body)("type").notEmpty().withMessage("Hotel type is required"),
    (0, express_validator_1.body)("pricePerNight").notEmpty().isNumeric().withMessage("Price per night is required and must be a number"),
    (0, express_validator_1.body)("facilities").notEmpty().isArray().withMessage("Facilities are required"),
], upload.array("imageFiles", 6), //use the same name in the frontend
hotelController_1.uploadData);
hotelRouter.get("/", userController_1.verifyToken, hotelController_1.getMyHotel);
hotelRouter.put("/:hotelId", userController_1.verifyToken, upload.array("imageFiles"), hotelController_1.updateHotel);
hotelRouter.get("/:id", userController_1.verifyToken, hotelController_1.getHotelById);
exports.default = hotelRouter;
