import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";

import ShortUrl from "./models/shortUrls.js";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import passwordRouter from "./routes/password.js";
import authenticateEmailRouter from "./routes/authenticateEmail.js";
import uploadFilesRouter from "./routes/uploadFiles.js";
import retrieveFileRouter from "./routes/retrieveFiles.js";

const app = express();

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoURI = `${process.env.mongoURI}`;

const connectToMongoDb = async () => {
  try {
    const result = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(process.env.PORT || 8585, "0.0.0.0");
    console.log(`Back end server running on ${process.env.PORT}`);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

connectToMongoDb();

app.post("/register", registerRouter);
app.get("/authemail/:username/:randomKey", authenticateEmailRouter);

app.post("/confirmEmailResetPassword", passwordRouter);
app.get("/reset/:username/:randomKey", passwordRouter);

app.post("/reset", async (req, res) => {
  console.log(req.body);
});

app.post("/resetPassword", passwordRouter);

app.post("/login", loginRouter);

// Route to show last few shortened urls along with original url and visit count
app.get("/recent/:username", authenticateToken, (req, res) => {
  const username = req.params.username;
  if (username === undefined || req.body.username === "") {
    res.status(400).json({ message: "Invalid credentials" });
  } else {
    ShortUrl.find({ username: username })
      .limit(5)
      .sort({ createdAt: "desc" })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => console.log(err));
  }
});

app.get("/recentAll", authenticateToken, (req, res) => {
  console.log("res.locals.username", res.locals.username);
  ShortUrl.find()
    .limit(5)
    .sort({ createdAt: "desc" })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log(err));
});

app.post("/authenticateSession", (req, res) => {
  // console.log("req.body", req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      console.log(payload);
      return res.status(200).send({ message: "OK" }); // pass the execution off to whatever request the client intended
    }
  });
});

app.post("/geturl", authenticateToken, uploadFilesRouter);

app.post("/puturl", authenticateToken, uploadFilesRouter);

app.get("/allfiles", authenticateToken, retrieveFileRouter);

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("passing bearer token", token);
  //console.log("token", token);
  if (token == null) return res.sendStatus(401); // if there isn't any token
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.log("err", err);
      return res.sendStatus(403).redirect("/login.html");
    } else {
      console.log(payload);
      res.locals.username = payload.data;
      next(); // pass the execution off to whatever request the client intended
    }
  });
}

app.get("/favicon.ico", (req, res) => {
  res.send();
});

// Route to show home page
app.get("/", (req, res) => {
  res.send({ msg: "HELLO FROM ONE OF THE POD" });
});
