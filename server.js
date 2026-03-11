import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { compactDecrypt, CompactEncrypt } from 'jose';
import NodeCache from 'node-cache';

dotenv.config();

const { Pool } = pkg;

// Cache to prevent Replay Attacks (store nonces for 60 seconds)
const nonceCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Parse JWE secret key
const SECRET_BASE64 = process.env.JWE_SECRET;
let secretKey = null;

if (SECRET_BASE64) {
    try {
        const binString = Buffer.from(SECRET_BASE64, 'base64');
        secretKey = new Uint8Array(binString.length);
        for (let i = 0; i < binString.length; i++) {
            secretKey[i] = binString[i];
        }
    } catch (e) {
        console.error("Failed to decode JWE_SECRET", e);
    }
} else {
    console.warn("⚠️ No JWE_SECRET found. Please run the generation script to create a secure key!");
}

const app = express();

// 1. Strict CORS setup - only allow frontend origin
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? 'https://your-production-domain.com' : 'http://localhost:8080',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// We need raw bodies for JWE strings ('application/jose' custom content type)
app.use(express.text({ type: 'application/jose' }));
app.use(express.json());

// 2. Global Rate Limiter to prevent brute-force or DDoS
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api/', apiLimiter);

// 3. JWE Encryption & Anti-Replay Middleware
async function verifyJWERequest(req, res, next) {
    // Check if the request is JWE encrypted
    if (!req.body || typeof req.body !== 'string') {
        return res.status(400).send("Bad Request: Expected JWE Encrypted Payload");
    }

    if (!secretKey) {
        return res.status(500).send("Internal Server Error: No Encryption Key configured");
    }

    try {
        // Decrypt the payload
        const { plaintext } = await compactDecrypt(req.body, secretKey);
        const decoder = new TextDecoder();
        const decryptedPayload = JSON.parse(decoder.decode(plaintext));

        // Anti-Replay logic
        const { _timestamp, _nonce } = decryptedPayload;

        if (!_timestamp || !_nonce) {
             return res.status(401).send("Unauthorized: Missing Anti-Replay Tokens in Payload");
        }

        const now = Date.now();
        // Allow requests up to 30 seconds old
        if (now - _timestamp > 30 * 1000 || now - _timestamp < -1000) {
            return res.status(401).send("Unauthorized: Request Expired (Timestamp validation failed)");
        }

        // Check if nonce was already used recently
        if (nonceCache.has(_nonce)) {
            return res.status(401).send("Unauthorized: Replay Attack Detected (Nonce already used)");
        }

        // Add nonce to cache to prevent replay
        nonceCache.set(_nonce, true);

        // Put legitimate data back onto the request object
        req.decryptedBody = decryptedPayload;
        
        next();
    } catch (err) {
        console.error("JWE Decryption Failed:", err.message);
        return res.status(401).send("Unauthorized: Invalid Encrypted Payload");
    }
}

// 4. JWE Encrypt Response Helper
async function sendEncryptedResponse(res, data) {
    if (!secretKey) return res.status(500).send("Internal Server Error");
    try {
        const encoder = new TextEncoder();
        const jwe = await new CompactEncrypt(encoder.encode(JSON.stringify(data)))
            .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
            .encrypt(secretKey);
        res.setHeader('Content-Type', 'application/jose');
        res.send(jwe);
    } catch (err) {
        console.error("Failed to encrypt response:", err);
        res.status(500).send("Encryption Failed");
    }
}

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Since the payload is encrypted in a POST request, we need to handle these APIs as POST
// --------------------------------------------------------------------------------------

// Endpoint to fetch machinery data (sheet1)
app.post('/api/machines', verifyJWERequest, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, factory, location, machine, tonase_t, tonase_raw FROM sheet1');
        await sendEncryptedResponse(res, rows);
    } catch (error) {
        console.error('Error fetching machines:', error);
        res.status(500).json({ error: 'Failed to fetch machinery data' });
    }
});

// Endpoint to fetch operators
app.post('/api/operators', verifyJWERequest, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM operators');
        await sendEncryptedResponse(res, rows);
    } catch (error) {
        console.error('Error fetching operators:', error);
        res.status(500).json({ error: 'Failed to fetch operators data' });
    }
});

// Endpoint to fetch sebango data
app.post('/api/sebango', verifyJWERequest, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM sebangodb');
        await sendEncryptedResponse(res, rows);
    } catch (error) {
        console.error('Error fetching sebango:', error);
        res.status(500).json({ error: 'Failed to fetch sebango data' });
    }
});

// Endpoint to fetch dept data
app.post('/api/dept', verifyJWERequest, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM dept');
        await sendEncryptedResponse(res, rows);
    } catch (error) {
        console.error('Error fetching dept:', error);
        res.status(500).json({ error: 'Failed to fetch dept data' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🔒 Secure Backend server running on http://127.0.0.1:${PORT}`);
});
