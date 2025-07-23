import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import fetch from 'node-fetch';
const app = express();
import connectDb from './models/db.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './Routes/OAuth/auth.js'



app.use(cookieParser());
app.use(cors({
    origin : process.env.FROTEND_URL,
    credentials : true
}))
app.use("/",authRouter)





app.listen(3000, () => console.log("🔑 Backend running on http://localhost:3000"));
