import File from "../models/file.js";

export const retrieveAllFiles = async (req, res) => { 
  console.log("retrieveAllFiles", res.locals.username);
  const dbResults = await File.find({ username: res.locals.username });
  const filesResponse = dbResults.map(result => { 
    return {fileName: result.fileName, fileType: result.fileType, filePath: result.filePath, username: result.username}
  })
  console.log(dbResults);
  return res.json({files: filesResponse});
}

export const retrieveOneFile = async (req, res) => { 

  
}