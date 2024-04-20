import express from 'express';
import { authEmail } from '../controllers/authenticateEmailController.js';

const authenticateEmailRouter = express.Router();

authenticateEmailRouter.get('/authEmail/:username/:randomKey', authEmail);

export default authenticateEmailRouter;