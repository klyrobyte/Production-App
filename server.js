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

// Endpoint to submit Production Data (prodata)
app.post('/api/prodata', verifyJWERequest, async (req, res) => {
    try {
        const {
            date, factory, tonase, sebango, shift, operator, mesin,
            act_total, act_ok, act_ct, plan_dangai, act_dangai, act_weight, loss_time,
            ng_awal, ng_proses, dan_go, dan_go_part, trial,
            plan_total, waste_weight
        } = req.decryptedBody;

        // 1. Validation: ACT_TOTAL >= ACT_OK
        if (Number(act_total) < Number(act_ok)) {
            return res.status(400).send("Validasi error: pokoknya ACT_TOTAL itu nggak boleh kurang dari ACT_OK.");
        }

        // 2. Validation & Derivation: NG_TOTAL = ACT_TOTAL - ACT_OK
        const ng_total = Number(act_total) - Number(act_ok);

        // 3. Validation: NG_AWAL + NG_PROSES === NG_TOTAL
        if ((Number(ng_awal) + Number(ng_proses)) !== ng_total) {
            return res.status(400).send("Validation Error: Intinya mah jumlah NG_AWAL plus NG_PROSES itu ya NG_TOTAL. Harus seimbang kiri-kanan, nggak boleh kurang, nggak boleh lebih. Kalau beda, berarti hitungannya ada yang meleset.");
        }

        // 4. KPI Calcs
        let ok_rasio = 0;
        if (Number(act_total) > 0) {
            ok_rasio = (Number(act_ok) / Number(act_total)) * 100;
        }

        let efisiensi = 0;
        if (Number(plan_total) > 0) {
            efisiensi = (Number(act_total) / Number(plan_total)) * 100;
        }

        let budomari = 0;
        const totalWeight = Number(act_weight) + Number(waste_weight);
        if (totalWeight > 0) {
            budomari = (Number(act_weight) / totalWeight) * 100;
        }

        // 5. Insert or Update Database
        let resultId;
        if (req.decryptedBody.id) {
            const updateQuery = `
                UPDATE prodata SET
                    date = $1, factory = $2, tonase = $3, sebango = $4, shift = $5, operator = $6, mesin = $7,
                    act_total = $8, act_ok = $9, act_ct = $10, plan_dangai = $11, act_dangai = $12, act_weight = $13, loss_time = $14,
                    ng_awal = $15, ng_proses = $16, ng_total = $17, dan_go = $18, dan_go_part = $19, trial = $20,
                    ok_rasio = ROUND($21::numeric, 3), efisiensi = ROUND($22::numeric, 3), budomari = ROUND($23::numeric, 2)
                WHERE id = $24 RETURNING id
            `;
            const values = [
                date, factory, tonase, sebango, shift, operator, mesin,
                act_total, act_ok, act_ct, plan_dangai, act_dangai, act_weight, loss_time,
                ng_awal, ng_proses, ng_total, dan_go, dan_go_part, trial,
                ok_rasio, efisiensi, budomari, req.decryptedBody.id
            ];
            const { rows } = await pool.query(updateQuery, values);
            if (rows.length === 0) {
                return res.status(404).send("Hmmm, data yang mau di-update nggak ketemu. Kayaknya emang nggak kedaftar dari awal..");
            }
            resultId = rows[0].id;
        } else {
            const insertQuery = `
                INSERT INTO prodata (
                    date, factory, tonase, sebango, shift, operator, mesin,
                    act_total, act_ok, act_ct, plan_dangai, act_dangai, act_weight, loss_time,
                    ng_awal, ng_proses, ng_total, dan_go, dan_go_part, trial,
                    ok_rasio, efisiensi, budomari
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20,
                    ROUND($21::numeric, 3), ROUND($22::numeric, 3), ROUND($23::numeric, 2)
                ) RETURNING id
            `;
            const values = [
                date, factory, tonase, sebango, shift, operator, mesin,
                act_total, act_ok, act_ct, plan_dangai, act_dangai, act_weight, loss_time,
                ng_awal, ng_proses, ng_total, dan_go, dan_go_part, trial,
                ok_rasio, efisiensi, budomari
            ];
            const { rows } = await pool.query(insertQuery, values);
            resultId = rows[0].id;
        }

        await sendEncryptedResponse(res, { success: true, id: resultId });
    } catch (error) {
        console.error('Error saat menyimpan data:', error);
        res.status(500).send('Gagal memproses data produksi');
    }
});

// Endpoint to fetch Statistik aggregated KPIs based on Month
app.post('/api/prodata/stats', verifyJWERequest, async (req, res) => {
    try {
        const payload = req.decryptedBody || {};
        const targetMonth = payload.month; // e.g., '2026-02'

        if (!targetMonth) {
            return res.status(400).send("Gagal: Parameter bulan tidak ada.");
        }

        const queryKPI = `
            SELECT 
                COALESCE(SUM(act_total), 0) AS total_output,
                COALESCE(SUM(act_ok), 0) AS total_ok,
                COALESCE(SUM(ng_total), 0) AS total_ng,
                COALESCE(AVG(ok_rasio), 0) AS avg_ok_ratio,
                COALESCE(AVG(efisiensi), 0) AS avg_efisiensi,
                COALESCE(AVG(budomari), 0) AS avg_budomari,
                COUNT(DISTINCT date) AS total_days
            FROM prodata
            WHERE TO_CHAR(date, 'YYYY-MM') = $1
        `;

        const queryDonut = `
            SELECT
                COALESCE(SUM(ng_awal), 0) AS sum_ng_awal,
                COALESCE(SUM(ng_proses), 0) AS sum_ng_proses,
                COALESCE(SUM(CAST(NULLIF(regexp_replace(dan_go, '[^0-9]', '', 'g'), '') AS INTEGER)), 0) AS sum_dan_go,
                COALESCE(SUM(CAST(NULLIF(regexp_replace(trial, '[^0-9]', '', 'g'), '') AS INTEGER)), 0) AS sum_trial,
                COALESCE(SUM(ng_total), 0) AS sum_ng_total
            FROM prodata
            WHERE TO_CHAR(date, 'YYYY-MM') = $1
        `;

        const queryTrend = `
            SELECT 
                TO_CHAR(date, 'YYYY-MM-DD') as date, 
                COALESCE(SUM(act_total), 0) AS total, 
                COALESCE(SUM(act_ok), 0) AS ok, 
                COALESCE(SUM(ng_total), 0) AS ng 
            FROM prodata 
            WHERE TO_CHAR(date, 'YYYY-MM') = $1 
            GROUP BY date 
            ORDER BY date
        `;

        const queryShiftAnalysis = `
            SELECT 
                shift, 
                COALESCE(SUM(act_ok), 0) AS ok 
            FROM prodata 
            WHERE TO_CHAR(date, 'YYYY-MM') = $1 AND shift IS NOT NULL AND shift != ''
            GROUP BY shift 
            ORDER BY shift
        `;

        const queryBestFactory = `
            SELECT factory, SUM(act_ok) as total_ok 
            FROM prodata 
            WHERE TO_CHAR(date, 'YYYY-MM') = $1 AND factory IS NOT NULL AND factory != ''
            GROUP BY factory 
            ORDER BY total_ok DESC 
            LIMIT 1
        `;

        const queryBestShift = `
            SELECT shift, SUM(act_ok) as total_ok 
            FROM prodata 
            WHERE TO_CHAR(date, 'YYYY-MM') = $1 AND shift IS NOT NULL AND shift != ''
            GROUP BY shift 
            ORDER BY total_ok DESC 
            LIMIT 1
        `;

        const [kpiRes, donutRes, trendRes, shiftRes, factoryRes, bestShiftRes] = await Promise.all([
            pool.query(queryKPI, [targetMonth]),
            pool.query(queryDonut, [targetMonth]),
            pool.query(queryTrend, [targetMonth]),
            pool.query(queryShiftAnalysis, [targetMonth]),
            pool.query(queryBestFactory, [targetMonth]),
            pool.query(queryBestShift, [targetMonth])
        ]);

        const kpiResult = kpiRes.rows[0] || {};
        const donutResult = donutRes.rows[0] || {};
        const bestFactory = factoryRes.rows[0]?.factory || "-";
        const bestShift = bestShiftRes.rows[0]?.shift || "-";

        await sendEncryptedResponse(res, {
            ...kpiResult,
            donut: donutResult,
            trend: trendRes.rows || [],
            shiftAnalysis: shiftRes.rows || [],
            best_factory: bestFactory,
            best_shift: bestShift
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).send('Gagal memuat statistik data.');
    }
});

const PORT = process.env.PORT || 5000;

// Initialize missing tables on startup
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS prodata (
                id SERIAL PRIMARY KEY,
                date DATE,
                factory VARCHAR,
                tonase VARCHAR,
                sebango VARCHAR,
                shift VARCHAR,
                operator VARCHAR,
                mesin VARCHAR,
                act_total INTEGER,
                act_ok INTEGER,
                act_ct NUMERIC,
                plan_dangai NUMERIC,
                act_dangai NUMERIC,
                act_weight NUMERIC,
                loss_time NUMERIC,
                ng_awal INTEGER,
                ng_proses INTEGER,
                ng_total INTEGER,
                dan_go VARCHAR,
                dan_go_part VARCHAR,
                trial VARCHAR,
                ok_rasio NUMERIC(6,3),
                efisiensi NUMERIC(6,3),
                budomari NUMERIC(6,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Database tables initialized (prodata verified)");
        app.listen(PORT, () => {
            console.log(`🔒 Secure Backend server running on http://127.0.0.1:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to initialize database schema:", err);
    }
}

initDB();
