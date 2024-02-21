"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../Controller/userController");
const express_validator_1 = require("express-validator");
const Router = express_1.default.Router();
Router.post("/register", [
    (0, express_validator_1.check)("firstName", "FirstName is Required").isString(),
    (0, express_validator_1.check)("lastName", "lastName is Required").isString(),
    (0, express_validator_1.check)("email", "Email is Required").isEmail(),
    (0, express_validator_1.check)("password", "password with 6 or more character required").isLength({
        min: 6,
    }),
], userController_1.register);
Router.get("/me", userController_1.verifyToken, userController_1.getInfo);
exports.default = Router;
