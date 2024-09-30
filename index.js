import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserRouter } from './router/user.js';
import { messageRouter } from './router/messageRoutes.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["https://filter-fe-two.vercel.app", "https://crm.woo-wa.com"], // Izinkan frontend dan CRM
    credentials: true,
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Izinkan metode HTTP ini
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With"],
}));

app.use(cookieParser());
app.use('/user', UserRouter);
app.use('/message', messageRouter)

mongoose.connect('mongodb://127.0.0.1:27017/dot-fullstack')
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }).catch(err => {
        console.error("Connection error", err);
    });
