import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Verify Auth0 Token
const verifyAuth0Token = async (token) => {
    try {
        const response = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

// Email Transporter
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Auth Callback Endpoint
app.post('/auth/callback', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const userInfo = await verifyAuth0Token(token);
    if (!userInfo) return res.status(401).json({ error: 'Invalid token' });

    const mailOptions = {
        from: EMAIL_USER,
        to: userInfo.email,
        subject: 'Your Authentication Token',
        text: `Your Auth0 token: ${token}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
