import express from 'express';
import Papa from 'papaparse';
import multer from 'multer';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer'
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const router = express.Router();

router.get("/getUserByUsername", async (req, res) => {
    const { username } = req.query;
    try {
        const user = await User.findOne({ username });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Simpan password langsung tanpa hashing
        const newUser = new User({
            username,
            password // Password langsung disimpan tanpa hashing
        });

        await newUser.save();
        return res.json({status: true, message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error registering user" });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({status: false, message: "Username atau Password SALAH" });
        }

        // Langsung bandingkan password tanpa menggunakan bcrypt
        if (user.password !== password) {
            return res.status(400).json({status: false, message: "Username atau Password SALAH" });
        }

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Pastikan env variabel diatur dengan benar
                pass: process.env.EMAIL_PASS  // Pastikan Anda menggunakan App Password jika pakai 2FA
            }
        });
        

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: "afriantolutfi@gmail.com",
            subject: 'notifikasi',
            text: `${username} sedang login`
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return res.json({ message: "Error sending email" });
            } else {
                return res.json({ status: true, message: "Email sent" });
            }
        });

        const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 360000 });
        return res.json({ status: true, message: "Login berhasil", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});

router.post('/upload', upload.single('file'), (req, res) => {
    try {
      const file = req.file;
  
      // Baca file CSV dari buffer
      const data = file.buffer.toString('utf8');
  
      // Parse CSV menggunakan papaparse
      const parsedData = Papa.parse(data, { header: true });
  
      // Track kombinasi nomor dan nama yang sudah dilihat
      const uniqueEntries = new Map();
  
      // Filter, hilangkan duplikat, dan ubah nama kolom phone_number ke number
      const filteredData = parsedData.data
        .filter(row => row.name && row.phone_number && row.phone_number.startsWith('08'))
        .map(row => {
          const cleanedName = row.name.replace(/"+/g, '');  // Bersihkan tanda kutip ganda
          const finalName = `"${cleanedName}"`;  // Tambahkan tanda kutip ganda di sekitar nama
          const cleanedNumber = row.phone_number.replace(/-/g, '').replace(/^0/, '+62');  // Format nomor telepon
  
          return {
            name: finalName,
            number: cleanedNumber
          };
        })
        .filter(row => {
          const entryKey = `${row.number}-${row.name}`; // Kombinasi nomor dan nama sebagai kunci
  
          // Cek apakah kombinasi nomor dan nama sudah ada
          if (!uniqueEntries.has(row.number)) {
            uniqueEntries.set(row.number, row.name);  // Simpan kombinasi nomor dan nama
            return true;
          } else {
            // Jika nomor sudah ada, pastikan nama berbeda
            if (uniqueEntries.get(row.number) !== row.name) {
              return true;  // Simpan jika nama berbeda meskipun nomor sama
            }
          }
  
          return false;
        });
  
      // Manual membangun CSV
      let csvContent = 'name,number\n';
      filteredData.forEach(row => {
        csvContent += `${row.name},${row.number}\n`;
      });
  
      // Kirim file CSV yang sudah difilter ke client
      res.attachment('filtered_data.csv');
      res.status(200).send(csvContent);
  
    } catch (err) {
      res.status(500).send('Error processing file');
    }
  });
  



router.get('/logout', (req, res) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: "afriantolutfi@gmail.com",
        subject: 'Notifikasi akun',
        text: `dia sudah logout`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return res.json({ message: "Error sending email" });
        } else {
            return res.json({ status: true, message: "Email sent" });
        }
    });
    res.clearCookie('token')
    return res.json({status : true})
})

export { router as UserRouter };