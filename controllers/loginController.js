import RegisterUser from "../models/registerUser.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const logInUser = async (req, res) => {
  console.log("/login", req.body);
  if (
    req.body.username === undefined ||
    req.body.username === "" ||
    req.body.password === undefined ||
    req.body.password === ""
  ) {
    res.status(400).json({ message: "Enter valid credentials" });
  } else {
    const user = await RegisterUser.findOne({ username: req.body.username });
    if (!user) {
      res.status(400).json({ message: "Invalid username or password" });
    } else if (!user.emailVerified) { 
      res.status(400).json({ message: "Please verify your email to signin" });
    } else {
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isPasswordValid) {
        const token = jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            data: user.username,
          },
          process.env.JWT_SECRET
        );
        res.json({ username: user.username, token });
      } else {
        res.status(400).json({ message: "Invalid username or password" });
      }
    }
  }
};
