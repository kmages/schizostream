import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import pg from "pg";
import { authStorage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);

  // Use a dedicated pool with SSL for GCP so the session store
  // doesn't drop connections on the first request
  const sessionPool = new pg.Pool({
    connectionString: process.env.CLOUD_DATABASE_URL || process.env.DATABASE_URL,
    ssl: process.env.CLOUD_DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 5,
  });
  sessionPool.on("error", (err) => {
    console.error("Session pool error (non-fatal):", err.message);
  });

  const sessionStore = new pgStore({
    pool: sessionPool,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const verifyCallback = async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
    try {
      await authStorage.upsertUser({
        id: profile.id,
        email: profile.emails?.[0]?.value ?? "",
        firstName: profile.name?.givenName ?? "",
        lastName: profile.name?.familyName ?? "",
        profileImageUrl: profile.photos?.[0]?.value ?? "",
      });
      done(null, { id: profile.id, email: profile.emails?.[0]?.value });
    } catch (err) {
      done(err as Error);
    }
  };

  // Register strategy with a placeholder; we'll override callbackURL per-request
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "https://schizostream.replit.app/api/auth/google/callback",
        proxy: true,
      },
      verifyCallback
    )
  );

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // Dynamically build callback URL from the incoming request host
  const buildCallbackURL = (req: any) =>
    `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

  app.get("/api/login", (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      callbackURL: buildCallbackURL(req),
    } as any)(req, res, next);
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: "/api/login",
      successRedirect: "/",
      callbackURL: buildCallbackURL(req),
    } as any)(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};
