const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { CompactEncrypt } = require('jose');
require('dotenv').config();

const SECRET_BASE64 = process.env.JWE_SECRET;
if (!SECRET_BASE64) {
    console.error("Missing JWE_SECRET in .env");
    process.exit(1);
}

const binString = Buffer.from(SECRET_BASE64, 'base64');
const secretKey = new Uint8Array(binString);

async function encryptData(data) {
    const encoder = new TextEncoder();
    const jwe = await new CompactEncrypt(encoder.encode(JSON.stringify(data)))
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .encrypt(secretKey);
    return jwe;
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(async () => {
    const pubDir = path.join(__dirname, 'public', 'json');
    if (!fs.existsSync(pubDir)) {
        fs.mkdirSync(pubDir, { recursive: true });
    }

    const machines = await client.query('SELECT id, factory, location, machine, tonase_t, tonase_raw FROM sheet1');
    fs.writeFileSync(path.join(pubDir, 'sheet1.json'), await encryptData(machines.rows));

    const operators = await client.query('SELECT * FROM operators');
    fs.writeFileSync(path.join(pubDir, 'operator.json'), await encryptData(operators.rows));

    const sebango = await client.query('SELECT * FROM sebangodb');
    fs.writeFileSync(path.join(pubDir, 'sebangodb.json'), await encryptData(sebango.rows));

    const dept = await client.query('SELECT * FROM dept');
    fs.writeFileSync(path.join(pubDir, 'dept.json'), await encryptData(dept.rows));

    console.log('JSON files securely populated and encrypted successfully!');
    client.end();
  })
  .catch(err => {
    console.error('Error generating JSON:', err);
    client.end();
  });
