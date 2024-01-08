import express from "express";
import { check } from "express-validator";
import { getUser, login, logout, verifyToken } from "../Controller/userController";


const authRouter = express.Router();

authRouter.post(
  "/login",
  [
    check("email", "email is required").isEmail(),
    check("password", "Password must be 6 to 20 characters long").isLength({
      min: 6,
    }),
  ],
  login
);

authRouter.post("/logout", logout);

authRouter.get("/validate-token", verifyToken, getUser);

export default authRouter;

