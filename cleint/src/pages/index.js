"use client";

import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0";

export default function Home() {
    const { user, error, isLoading } = useUser();

    const sendToken = async () => {
        if (!user) return;

        try {
            // Fetch Auth0 access token
            const tokenRes = await axios.get("/api/auth/token"); // Fetch from API route
            const accessToken = tokenRes.data.token;

            if (!accessToken) {
                alert("Failed to retrieve access token");
                return;
            }

            // Send the access token to backend
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/callback`, {
                token: accessToken,
            });

            alert(res.data.message);
        } catch (err) {
            console.error("Error sending token:", err);
        }
    };

    return (
        <div>
            <h1>Next.js + Auth0 + Node.js</h1>
            {!user ? (
                <a href="/api/auth/login">Login</a>
            ) : (
                <>
                    <p>Welcome, {user.name}</p>
                    <button onClick={sendToken}>Send Token</button>
                    <a href="/api/auth/logout">Logout</a>
                </>
            )}
        </div>
    );
}
