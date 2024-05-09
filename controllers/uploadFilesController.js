import dotenv from "dotenv";
dotenv.config();

import { S3, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import File from "../models/file.js";

const config = {
  bucketName: process.env.REACT_APP_BUCKET_NAME,
  dirName: process.env.REACT_APP_DIR_NAME /* optional */,
  region: process.env.REACT_APP_REGION,
  accessKeyId: process.env.REACT_APP_ACCESS_ID,
  secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
};

const creds = {
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
};

const s3Client = new S3({
  region: config.region,
  apiVersion: "2006-03-01",
  credentials: creds,
});


export const generatePutUrl = async (req, res) => {
  console.log("generatePutUrl", req.body.filename, req.body.filetype);
  console.log('res.locals.username', res.locals.username)

  const params = {
    Bucket: config.bucketName,
    Key: `${res.locals.username}/${req.body.filename}`,
  };

  const uploadFile = new File({
    username: res.locals.username,
    fileName:req.body.filename,
    fileType:req.body.filetype,
    filePath:`${res.locals.username}/${req.body.filename}`
  });

  const fileDbUploadResult = await uploadFile.save();
  console.log('fileDbUploadResult',fileDbUploadResult);
  try {
    // Create the command.
    const command = new PutObjectCommand(params);

    // Create the presigned URL.
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    console.log(`\nPutting "${params.Key}" using signedUrl with body "${params.Body}" in v3`);
    console.log(signedUrl);
    return res.json({ url: signedUrl});
  } catch (err) {
    console.log("Error creating presigned URL", err);
  }

  return res.json({message: 'error'});
};

export const generateGetUrl = async (req, res) => {
  const params = {
    Bucket: config.bucketName,
    Key: `${res.locals.username}/${req.body.filename}`,
  };

  try {
    // Create the command.
    const command = new GetObjectCommand(params);

    // Create the presigned URL.
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    console.log(`\nPutting "${params.Key}" using signedUrl with body "${params.Body}" in v3`);
    console.log(signedUrl);
    return res.json({ url: signedUrl});
  } catch (err) {
    console.log("Error creating presigned URL", err);
  }

  return res.json({message: 'error'});
};

export const uploadFile = async (req, res) => {
  return res.send("uploadFile");
};
