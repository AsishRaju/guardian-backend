import express from "express";

import { uploadFile, generatePutUrl, generateGetUrl } from '../controllers/uploadFilesController.js';

const uploadFilesRouter = express.Router();

uploadFilesRouter.post("/uploadfile", uploadFile);
uploadFilesRouter.post("/puturl", generatePutUrl);
uploadFilesRouter.post("/geturl", generateGetUrl);

export default uploadFilesRouter;
