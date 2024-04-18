import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const registerUserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  emailVerified: {
    type: Boolean,
    required: true
  },
  randomKey: {
    type: String,
    required: true
  }
  
}, {timestamps: true});

const RegisterUser = mongoose.model('RegisterUser', registerUserSchema);

export default RegisterUser;