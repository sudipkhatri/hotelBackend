import mongoose from "mongoose";
import bycrypt from "bcryptjs";
import { userType } from "../Shared/types";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function(next){
  if(this.isModified('password')){
    this.password = await bycrypt.hash(this.password, 8)
  }
  next();
})

const User = mongoose.model<userType>("User", userSchema);

export default User;