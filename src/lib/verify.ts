import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";

/**
 * Stateless email-verification for guest registration. A short-lived signed JWT
 * carries the pending registration plus an HMAC of the emailed code — never the
 * code itself — so the client can't read the code out of the token, and no DB
 * row is created until the code is confirmed.
 */

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

/** Keyed HMAC of the code. Reversible only with AUTH_SECRET (server-only). */
export function hmacCode(code: string) {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return crypto.createHmac("sha256", s).update(code).digest("hex");
}

/** Cryptographically-random 6-digit code, zero-padded. */
export function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export interface PendingReg {
  first: string;
  last: string;
  email: string;
  phone: string;
  zip: string;
  sms: boolean;
}

export async function signPendingToken(reg: PendingReg, codeHash: string) {
  return new SignJWT({ reg, codeHash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
}

export async function verifyPendingToken(
  token: string
): Promise<{ reg: PendingReg; codeHash: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const reg = payload.reg as PendingReg | undefined;
    const codeHash = payload.codeHash as string | undefined;
    if (!reg || !codeHash) return null;
    return { reg, codeHash };
  } catch {
    return null;
  }
}

/** Login token for a returning guest — carries their registrant id, not form data. */
export async function signLoginToken(
  uid: string,
  email: string,
  codeHash: string
) {
  return new SignJWT({ uid, email, codeHash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
}

export async function verifyLoginToken(
  token: string
): Promise<{ uid: string; email: string; codeHash: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const uid = payload.uid as string | undefined;
    const codeHash = payload.codeHash as string | undefined;
    if (!uid || !codeHash) return null;
    return { uid, email: String(payload.email ?? ""), codeHash };
  } catch {
    return null;
  }
}

/** Constant-time compare of two same-length hex HMACs. */
export function codeMatches(expectedHash: string, submittedCode: string) {
  const actual = hmacCode(submittedCode);
  if (actual.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expectedHash));
}
