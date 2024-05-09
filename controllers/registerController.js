import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID = `${process.env.CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.CLIENT_SECRET}`;
const REDIRECT_URI = `${process.env.REDIRECT_URI}`;
const REFRESH_TOKEN = `${process.env.REFRESH_TOKEN}`;

import RegisterUser from "../models/registerUser.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"; //importing node mailer
import { google } from "googleapis";
import { nanoid } from "nanoid";

export const registerUser = async (req, res) => {
  console.log("/register", req.body);

  if (
    req.body.username === undefined ||
    req.body.username === "" ||
    req.body.password === undefined ||
    req.body.password === "" ||
    req.body.firstName === undefined ||
    req.body.firstName === "" ||
    req.body.lastName === undefined ||
    req.body.lastName === ""
  ) {
    res.status(400).json({ message: "Enter valid credentials" });
  } else {
    const user = await RegisterUser.findOne({ username: req.body.username });

    if (user) {
      res.status(409).json({ message: "Username already exists" });
    } else {
      try {
        const randomKey = nanoid(10).toLowerCase();
        const hash = await bcrypt.hash(req.body.password, 10);
        console.log(hash, req.body.password);
        const registerUser = new RegisterUser({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          password: hash,
          emailVerified: false,
          randomKey: randomKey
        });

        //Send Verification Email
        
        const authEmailLink = `${process.env.backEndUrl}/authEmail/${req.body.username}/${randomKey}`;
        console.log("authEmailLink", authEmailLink);

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
          to: `${req.body.username}`, //replace with your email
          subject: `Verify Your Email`,
          html: `<p> Please click the link to verify your email ${authEmailLink} in a browser window</p><br>
                  <a href=${authEmailLink}></a>`,
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

        registerUser
          .save()
          .then((result) => res.json({ username: result.username }))
          .catch((err) => console.log(err));
      } catch (err) {
        console.error("error while hashing or storing user info into db", err);
      }
    }
  }
};
