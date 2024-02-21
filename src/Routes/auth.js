"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const userController_1 = require("../Controller/userController");
const authRouter = express_1.default.Router();
authRouter.post("/login", [
    (0, express_validator_1.check)("email", "email is required").isEmail(),
    (0, express_validator_1.check)("password", "Password must be 6 to 20 characters long").isLength({
        min: 6,
    }),
], userController_1.login);
authRouter.post("/logout", userController_1.logout);
authRouter.get("/validate-token", userController_1.verifyToken, userController_1.getUser);
exports.default = authRouter;
