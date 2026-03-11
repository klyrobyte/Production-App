import { CompactEncrypt, compactDecrypt } from 'jose';

// Get the key from Vite env variables
// Usually this is 32 bytes base64 encoded string
const SECRET_BASE64 = import.meta.env.VITE_JWE_SECRET;
let secretKey: Uint8Array | null = null;

if (SECRET_BASE64) {
  // Try to decode the base64 string to bytes
  try {
    const binString = atob(SECRET_BASE64);
    secretKey = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
      secretKey[i] = binString.charCodeAt(i);
    }
  } catch (e) {
    console.error("Failed to decode VITE_JWE_SECRET");
  }
}

/**
 * Encrypt a JSON payload to a JWE Compact string.
 */
export async function encryptPayload(payload: any): Promise<string> {
  if (!secretKey) throw new Error("No VITE_JWE_SECRET found in environment");

  const encoder = new TextEncoder();
  
  // Attach Anti-Replay data (timestamp and random nonce)
  const securePayload = {
    ...payload,
    _timestamp: Date.now(),
    _nonce: crypto.randomUUID(), 
  };

  const jwe = await new CompactEncrypt(encoder.encode(JSON.stringify(securePayload)))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(secretKey);

  return jwe;
}

/**
 * Decrypt a JWE Compact string back to JSON.
 */
export async function decryptPayload(jweString: string): Promise<any> {
    if (!secretKey) throw new Error("No VITE_JWE_SECRET found in environment");

    const { plaintext } = await compactDecrypt(jweString, secretKey);
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(plaintext));
}

/**
 * Wrapper for fetch that encrypts the request payload and decrypts the response.
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<any> {
    // We strictly use POST for secure requests to send encrypted bodies, 
    // even if it's logically a "GET" fetching data.
    
    const requestPayload = options.body ? JSON.parse(options.body as string) : {};
    const encryptedBody = await encryptPayload(requestPayload);

    const secureOptions: RequestInit = {
        ...options,
        method: 'POST',
        headers: {
            ...options.headers,
            'Content-Type': 'application/jose', // Explicitly denote JWE
        },
        body: encryptedBody
    };

    const response = await fetch(url, secureOptions);

    if (!response.ok) {
        throw new Error(`Secure Fetch Error: ${response.status} ${response.statusText}`);
    }

    // The backend should respond with a JWE string as well
    const responseJwe = await response.text();
    
    if (!responseJwe) return null;

    try {
        const decryptedData = await decryptPayload(responseJwe);
        return decryptedData;
    } catch (err) {
        console.error("Failed to decrypt server response. Make sure keys match.");
        throw err;
    }
}
