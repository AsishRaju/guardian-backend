import express from "express";

import { registerUser } from '../controllers/registerController.js';

const registerRouter = express.Router();

registerRouter.post("/register", registerUser);

export default registerRouter;
