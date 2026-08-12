const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Sale = require('./models/Sale');
const Cashier = require('./models/Cashier'); // 1. የካሸር ሞዴልን ማስገባት

const app = express();
app.use(express.json());
app.use(cors());

// 2. የ client ፎልደርን እንደ Static ዌብሳይት ማስተናገጃ እንጠቀመዋለን
app.use(express.static(path.join(__dirname, 'client')));

// ከ MongoDB Atlas ጋር መገናኘት 
const MONGO_URI = 'mongodb://birukabera1707_db_user:biruk17@ac-jhmdzvj-shard-00-00.rkagfg3.mongodb.net:27017,ac-jhmdzvj-shard-00-01.rkagfg3.mongodb.net:27017,ac-jhmdzvj-shard-00-02.rkagfg3.mongodb.net:27017/Ema_Burger?ssl=true&replicaSet=atlas-tsrnvd-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('MongoDB Atlas (Ema_Burger) Connected successfully!');
})
.catch((err) => {
    console.log('Database connection error:', err);
});

// ==================== SALES ROUTES ====================

// 1. ሁሉንም ሽያጮች ከዳታቤዝ ለማምጣት (GET)
app.get('/api/sales', async (req, res) => {
    try {
        const sales = await Sale.find().sort({ _id: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. አዲስ ሽያጭ ወደ ዳታቤዝ ለመመዝገብ (POST)
app.post('/api/sales', async (req, res) => {
    try {
        const { category, itemName, quantity, price } = req.body;
        const total = quantity * price;
        const date = req.body.date || new Date().toISOString();

        const newSale = new Sale({
            category,
            itemName,
            quantity,
            price,
            total,
            date
        });

        const savedSale = await newSale.save();
        res.status(201).json(savedSale);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. ሽያጭ ከዳታቤዝ ለመሰረዝ (DELETE)
app.delete('/api/sales/:id', async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        // ሽያጩ ከተመዘገበበት ሰዓት ጀምሮ ያለውን ልዩነት ማስላት (በደቂቃ)
        const saleDate = new Date(sale.createdAt || sale.date);
        const now = new Date();
        const diffMinutes = (now - saleDate) / (1000 * 60);

        // ከ 20 ደቂቃ በላይ ከሆነ ማጥፋት አይቻልም
        if (diffMinutes > 20) {
            return res.status(400).json({ error: 'Sale cannot be deleted after 20 minutes' });
        }

        await Sale.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sale deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==================== CASHIER ROUTES ====================

// 1. የካሸር ሎጊን ማረጋገጫ (Login API - ሞባይል እና ፒሲ ላይ በአንድነት ይሰራሉ)
app.post('/api/cashiers/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const cashier = await Cashier.findOne({ username, password });
        if (cashier) {
            res.json({ success: true, role: "cashier" });
        } else {
            res.status(401).json({ success: false, error: "Invalid Username or Password" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. የተመዘገቡ ካሸሮችን ዝርዝር ማምጣት (ለባለቤቱ ዳሽቦርድ)
app.get('/api/cashiers', async (req, res) => {
    try {
        const cashiers = await Cashier.find().sort({ _id: -1 });
        res.json(cashiers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. አዲስ ካሸር መመዝገቢያ (በባለቤቱ ብቻ የሚደረግ)
app.post('/api/cashiers', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newCashier = new Cashier({ username, password });
        const savedCashier = await newCashier.save();
        res.status(201).json(savedCashier);
    } catch (err) {
        res.status(400).json({ error: 'Username already exists or invalid data' });
    }
});

// 4. የካሸር የይለፍ ቃል ማስተካከያ (በባለቤቱ ብቻ የሚደረግ)
app.put('/api/cashiers/:id', async (req, res) => {
    try {
        const { password } = req.body;
        const updatedCashier = await Cashier.findByIdAndUpdate(
            req.params.id,
            { password },
            { new: true }
        );
        if (!updatedCashier) {
            return res.status(404).json({ error: 'Cashier not found' });
        }
        res.json({ message: 'Password updated successfully by owner', updatedCashier });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. ካሸርን ከዳታቤዝ መሰረዝ (በባለቤቱ ብቻ)
app.delete('/api/cashiers/:id', async (req, res) => {
    try {
        const deletedCashier = await Cashier.findByIdAndDelete(req.params.id);
        if (!deletedCashier) {
            return res.status(404).json({ error: 'Cashier not found' });
        }
        res.json({ message: 'Cashier deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ሰርቨሩ የሚጀምርበት ፖርት (Render በራሱ ፖርት እንዲሰጠው process.env.PORT እንጠቀማለን)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});