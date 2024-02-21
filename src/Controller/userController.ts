import User from "../Models/user";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { email, firstName, lastName, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user already exist!" });
    }
    user = new User({
      email,
      firstName,
      lastName,
      password,
    });
    await user.save();
    const token = jwt.sign(
      { userID: user._id },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("auth_token", token, {
      httpOnly: true, //it means the cookie only available in http and not https
      secure: process.env.NODE_ENV === "production", //for local host it should be false
      maxAge: 86400000,
    });
    return res.status(201).json({ message: "user registration success" });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong!" });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const userPass = user.password;
    const isMatched = await bcrypt.compare(password, userPass);
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid credentials." }); //don't return invalid password hackers
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("auth_token", token, {
      httpOnly: true, //it means the cookie only available in http and not https
      secure: process.env.NODE_ENV === "production", //for local host it should be false
      maxAge: 86400000,
    });
    res.status(200).json({ userId: user._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("auth_token", " ", {
    expires: new Date(0),
  });
  return res.status(200).json({ message: "logged out succesfully" });
};

export const getUser = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "user logged in" });
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["auth_token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    req.userId = (verify as JwtPayload).userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized." });
  }
};

export const getInfo = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if(!user){
      return res.status(404).json({message:"User not found."})
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
