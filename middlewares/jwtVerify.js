import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken';
const SECRET_CODE = process.env.SECRET_CODE;

const verifyToken = (req,res,next) =>{
    const  {access_token ,user_token} = req.cookies;
    if(!access_token || !user_token){
        res.json({
            success : false,
            msg : "No token found"
        })
    }
    const userTokenDecoded = jwt.verify(user_token ,SECRET_CODE);
    const accessTokenDecoded = jwt.verify(access_token , SECRET_CODE);
    if(!userTokenDecoded){
        res.json({
            success : false,
            msg : "user_token_expired"
        })
    }
    if(!accessTokenDecoded.access_token){
        res.json({
            success : false,
            msg : "access_token_expired"
        });
        return;
    }
     
    next();
}

export default verifyToken