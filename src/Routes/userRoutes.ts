import express from "express";
import { getInfo, register, verifyToken } from "../Controller/userController";
import { check } from "express-validator";

const Router = express.Router();

Router.post(
  "/register",
  [
    check("firstName", "FirstName is Required").isString(),
    check("lastName", "lastName is Required").isString(),
    check("email", "Email is Required").isEmail(),
    check("password", "password with 6 or more character required").isLength({
        min: 6,
    }),
  ],
  register
);

Router.get("/me", verifyToken, getInfo)

export default Router;


  