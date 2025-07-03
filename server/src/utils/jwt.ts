import jwt, { SignOptions } from "jsonwebtoken";

type ExpiresIn = "15m" | "1h" | "7d" | "30d" | number;

const generateToken = (
  payload: object,
  secret: string,
  expiresIn: ExpiresIn
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};

export { generateToken, verifyToken };
