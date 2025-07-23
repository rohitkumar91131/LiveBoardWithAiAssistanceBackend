import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
const router = express.Router();
import User from '../../models/user.js';
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REDIRECT_TO_FRONTEND = process.env.REDIRECT_TO_FRONTEND;
const SECRET_CODE = process.env.SECRET_CODE;
import jwt from 'jsonwebtoken';
import verifyToken from '../../middlewares/jwtVerify.js';

router.get("/auth/google/callback",async(req,res)=>{
    const code = req.query.code;
    if(!code){
        return;
    }
    console.log(REDIRECT_URI)
    try{
        const tokenRes = await fetch("https://oauth2.googleapis.com/token",{
            method : "POST",
            headers : {
                'content-type' : "application/x-www-form-urlencoded"
            },
            body : new URLSearchParams({
                code,
                client_id : CLIENT_ID,
                client_secret : CLIENT_SECRET,
                redirect_uri : REDIRECT_URI,
                grant_type : 'authorization_code'
            })
        });
        const tokenData = await tokenRes.json();
        const { access_token, refresh_token ,id_token } = tokenData;
        console.log(tokenData);
        const userRes = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json",{
            headers : {
                Authorization : `Bearer ${access_token}`
            }
        });
        const user = await userRes.json();
        const isExist = await User.findOne({googleId : user.id});
        if(!isExist){
            const newUser = new User({
                googleId : user.id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                refreshToken: refresh_token
            });
            await newUser.save();
        }
        else if(refresh_token){
            isExist.refreshToken = refresh_token;
            await isExist.save();
        }
        const id = jwt.sign(
            {
                "userId" : user.id
            },
            SECRET_CODE,
            {
               expiresIn :"30d"
            }
        )
        const accessToken = jwt.sign(
            {
                "access_token" : access_token
            },
            SECRET_CODE,
            {
                expiresIn : "15m"
            }
        )
        res.cookie("access_token",accessToken,{
            httpOnly : true,
            secure : true,
            sameSite : "none",
            maxAge : 7 * 24 * 60 * 60 * 1000
        })
        res.cookie("user_token",id,{
            httpOnly : true,
            secure : true,
            sameSite :"none",
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        res.redirect(REDIRECT_TO_FRONTEND)
    }
    catch(err){
        console.log(err.message)
        res.status(500).send("Authentication failed");
    }
})


router.get("/auth/refresh",async(req,res)=>{
    const  {access_token ,user_token}  = req.cookies;
    if(!user_token){
        return res.json({
            success : false,
            msg : "No user token found"
        })   
    }
    try{
        const userTokenDecoded = jwt.verify(user_token , SECRET_CODE)
        const user = await User.findOne({})
        const tokenRes = await fetch("https://oauth2.googleapis.com/token",{
            method : "POST",
            headers : {
                "content-type"  :"application/x-www-form-urlencoded"
            },
            body : new URLSearchParams({
                client_id : CLIENT_ID,
                client_secret : CLIENT_SECRET,
                refresh_token : "1//0gXDksJNqNZveCgYIARAAGBASNwF-L9IrczV181S4aKJ-gvD8vtYh9FyA5wuAlaPhb2Eguu-Ge713jDfZs1R5R-qEfASdcPruPAY",
                grant_type : "refresh_token"
            })
        })
        const tokenData = await tokenRes.json();
        const newAccessToken = jwt.sign(
            {
                "access_token" : "Hi"
            },
            SECRET_CODE,
            {
                expiresIn : "15m"
            }
        )
        const newUserToken = jwt.sign(
            {
                "userId" : user.googleId
            },
            SECRET_CODE,
            {
               expiresIn :"30d"
            }
        )
        res.cookie("access_token",newAccessToken,{
            httpOnly : true,
            secure : true,
            sameSite : "none",
            maxAge : 7 * 24 * 60 * 60 * 1000
        })
        res.cookie("user_token",newUserToken,{
            httpOnly : true,
            secure : true,
            sameSite :"none",
            maxAge : 7 * 24 * 60 * 60 * 1000
        })
        res.json({
            success : true,
            msg : "Token refreshed",
            tokenData
        })
    }
    catch(err){
        console.log(err.message);
        res.json({
            success : false,
            msg : err.message
        })
    }
})

router.get("/verifyLoginStatus",async(req,res)=>{
    try{
        let {access_token ,user_token } = req.cookies;
        if(!access_token || !user_token) {
            return res.json({
                success : false,
                msg :"No cookies found"
            })
        }
        const user_token_decoded = jwt.verify(user_token,process.env.SECRET_CODE);
        if(!user_token_decoded){
            return res.json({
                success : false,
                msg : "No cookies found"
            })
        }
        const access_token_decoded = jwt.verify(access_token , process.env.SECRET_CODE);
        if(!access_token_decoded){
            return res.json({
                success : false,
                msg : "No access Token"
            })
        }
        res.json({
            success : true,
            msg : "U are logged in "
        })
    }
    catch(err){
        console.log(err.message)
    }
})
export default router