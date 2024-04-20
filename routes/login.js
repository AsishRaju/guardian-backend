import express from 'express';
import { logInUser } from '../controllers/loginController.js';

const loginRouter = express.Router();

loginRouter.post('/login', logInUser);

export default loginRouter;