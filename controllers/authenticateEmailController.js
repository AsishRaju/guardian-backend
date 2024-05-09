import RegisterUser from '../models/registerUser.js';

export const authEmail = async (req, res) => { 
  console.log('/authEmail', req.body);
  console.log('req.params ',req.params);
  const result = await RegisterUser.findOne({username: req.params.username});
  console.log(result);
  
  if (result.emailVerified) { 
    return res.status(302).redirect(`${process.env.frontEndUrl}/home`);
  }

  if (result.randomKey === req.params.randomKey) {
    const dbResult = await RegisterUser.updateOne( { username: result.username },{ emailVerified: true});
    res.status(302).redirect(`${process.env.frontEndUrl}/home`);
  } else {
    res.status(302).redirect(`${process.env.frontEndUrl}/signup`);
  }
}