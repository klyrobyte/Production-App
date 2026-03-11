import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Endpoint to fetch machinery data (sheet1)
app.get('/api/machines', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, factory, location, machine, tonase_t, tonase_raw FROM sheet1');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching machines:', error);
        res.status(500).json({ error: 'Failed to fetch machinery data' });
    }
});

// Endpoint to fetch operators
app.get('/api/operators', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM operators');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching operators:', error);
        res.status(500).json({ error: 'Failed to fetch operators data' });
    }
});

// Endpoint to fetch sebango data
app.get('/api/sebango', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM sebangodb');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sebango:', error);
        res.status(500).json({ error: 'Failed to fetch sebango data' });
    }
});

// Endpoint to fetch dept data
app.get('/api/dept', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM dept');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching dept:', error);
        res.status(500).json({ error: 'Failed to fetch dept data' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});
