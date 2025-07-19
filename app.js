import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import fetch from 'node-fetch';
const app = express();


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REDIRECT_TO_FRONTEND = process.env.REDIRECT_TO_FRONTEND
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    const { access_token, id_token } = tokenData;

    const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`);
    const user = await userInfoRes.json();

    res.redirect(`http://localhost:5173/profile?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).send("Authentication failed");
  }
});

app.listen(3000, () => console.log("🔑 Backend running on http://localhost:3000"));
