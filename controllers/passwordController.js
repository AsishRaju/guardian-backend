import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID = `${process.env.CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.CLIENT_SECRET}`;
const REDIRECT_URI = `${process.env.REDIRECT_URI}`;
const REFRESH_TOKEN = `${process.env.REFRESH_TOKEN}`;

import RegisterUser from "../models/registerUser.js";
import UserPasswordReset from "../models/userPasswordReset.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import nodemailer from "nodemailer"; //importing node mailer
import { google } from "googleapis";

export const confirmEmailResetPassword = async (req, res) => {
  if (req.body.username === undefined || req.body.username === "") {
    res.status(400).json({ message: "Enter valid email ID" });
  } else {
    const user = await RegisterUser.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({ message: "User doesn't  exists" });
    } else {
      //As the user exists,
      // Create a random 10 digit number and store it in the user document as an object with values {key: randomNumber, username: userEmail}
      const randomKey = nanoid(10).toLowerCase();
      const userPasswordResetObj = new UserPasswordReset({
        randomKey: randomKey,
        username: user.username,
        expirationDate: addMinutes(new Date(), 10),
      });

      await userPasswordResetObj.save();

      const resetPasswordLink = `${process.env.backEndUrl}/reset/${user.username}/${randomKey}`;
      console.log("resetPasswordLink", resetPasswordLink);
      // Create a link the reset/:email/:randomnumber route on the backend and send it to the user email using nodemailer

      const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
      const accessToken = await oAuth2Client.getAccessToken();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "ravikiransjce.code@gmail.com", //replace with your email
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
        tls: { rejectUnauthorized: false },
      });

      const mailOptions = {
        from: "<ravikriansjce.code@gmail.com>", //replace with your email
        to: `${user.username}`, //replace with your email
        subject: `PASSWORD RESET`,
        html: `<p> Please click the link to reset your password or copy paste ${resetPasswordLink} in a browser window</p><br>
                <a href=${resetPasswordLink}></a>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.json({ message: "User doesn't  exists" }); // if error occurs send error as response to client
        } else {
          console.log("Email sent: " + info.response);
          return res.json({ message: "Sent Successfully" }); //if mail is sent successfully send Sent successfully as response
        }
      });
      // return res.status(200).json({message: "Check your email for reset options"});
    }
  }
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export const resetPassword = async (req, res) => {
  const result = await UserPasswordReset.find({
    username: req.body.username,
  }).sort({ createdAt: "desc" });
  const latestResetObj = result[0];
  if (latestResetObj.expirationDate > new Date()) {
    const hash = await bcrypt.hash(req.body.password, 10);
    const dbResult = await RegisterUser.updateOne(
      { username: latestResetObj.username },
      { password: hash }
    );
    res.json({
      message: "Password reset successfully",
      username: latestResetObj.username,
    });
  }
};

export const resetUsernameRandomKey = async (req, res) => {
  console.log('req.params ',req.params);
  const result = await UserPasswordReset.find({username: req.params.username}).sort({createdAt: "desc"});
  console.log(result);
  const latestResetObj = result[0];
  if(latestResetObj.expirationDate > new Date()){
    res.status(302).redirect(`${process.env.frontEndUrl}/reset?username=${latestResetObj.username}&key=${latestResetObj.randomKey}`);
  } else {
    res.status(302).redirect(`${process.env.frontEndUrl}/confirmemail`);
  }
}