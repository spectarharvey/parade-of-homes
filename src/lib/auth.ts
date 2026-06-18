import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "poh_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "ADMIN" | "BUILDER";

export interface SessionData {
  sub: string; // account id
  email: string;
  role: Role;
  builderId: string | null;
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(data: SessionData) {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub ?? payload["sub"]),
      email: String(payload["email"]),
      role: payload["role"] as Role,
      builderId: (payload["builderId"] as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Reads + verifies the current session from the request cookies. */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(data: SessionData) {
  const token = await createSessionToken(data);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Validates credentials against the Account table. Returns session data or null. */
export async function authenticate(
  email: string,
  password: string
): Promise<SessionData | null> {
  const account = await prisma.account.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!account) return null;
  const ok = await bcrypt.compare(password, account.passwordHash);
  if (!ok) return null;
  return {
    sub: account.id,
    email: account.email,
    role: account.role as Role,
    builderId: account.builderId,
  };
}
