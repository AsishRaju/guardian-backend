import express from "express";

import { retrieveAllFiles, retrieveOneFile } from '../controllers/retrieveFilesController.js';

const retrieveFilesRouter = express.Router();

retrieveFilesRouter.get("/allfiles", retrieveAllFiles);
retrieveFilesRouter.get("/file", retrieveOneFile);


export default retrieveFilesRouter;
