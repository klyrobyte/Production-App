import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

// Create a connection pool to the XAMPP MySQL database
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'prod',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Endpoint to fetch machinery data (sheet1)
app.get('/api/machines', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT `id`, `factory`, `location`, `machine`, `tonase_t`, `tonase_raw` FROM sheet1');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching machines:', error);
        res.status(500).json({ error: 'Failed to fetch machinery data' });
    }
});

// Endpoint to fetch operators
app.get('/api/operators', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM operators');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching operators:', error);
        res.status(500).json({ error: 'Failed to fetch operators data' });
    }
});

// Endpoint to fetch sebango data
app.get('/api/sebango', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sebangodb');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sebango:', error);
        res.status(500).json({ error: 'Failed to fetch sebango data' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});
