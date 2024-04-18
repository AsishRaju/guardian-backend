import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
  
}, {timestamps: true});

const File = mongoose.model('File', fileSchema);

export default File;