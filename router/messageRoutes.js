// router/messageRoutes.js

import express from 'express';
import axios from 'axios';
import { User } from '../models/User.js';

const router = express.Router();

router.post('/send-message', async (req, res) => {
    const { username, number, message } = req.body;

    // Ambil deviceId dari database
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
    }

    const deviceId = user.password; // Pastikan field ini benar

    const data = {
        deviceId: deviceId,
        number: number.replace('+', ''), // Menghapus tanda '+' jika ada
        message: message,
    };

    console.log("Device ID:", deviceId);
    console.log("Number (formatted):", data.number);
    console.log("Message:", message);

    try {
        const response = await axios.post('https://crm.woo-wa.com/send/message-text', data);
        return res.json({ status: true, message: "Pesan terkirim", response: response.data });
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        return res.status(500).json({ status: false, message: "Gagal mengirim pesan", error: error.message });
    }
});

export { router as messageRouter };
