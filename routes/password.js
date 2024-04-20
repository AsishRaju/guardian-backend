
import express from "express";

import { confirmEmailResetPassword, resetPassword, resetUsernameRandomKey } from '../controllers/passwordController.js';

const passwordRouter = express.Router();

passwordRouter.post("/confirmEmailResetPassword", confirmEmailResetPassword);

passwordRouter.post("/resetPassword", resetPassword);

passwordRouter.get('/reset/:username/:randomKey', resetUsernameRandomKey);

export default passwordRouter;
