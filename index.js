// index.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserRouter } from './router/user.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["https://filter-fe-two.vercel.app", "https://crm.woo-wa.com"], // Izinkan frontend dan CRM
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(cookieParser());
app.use('/user', UserRouter);

mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch(err => {
        console.error("Connection error", err);
    });

