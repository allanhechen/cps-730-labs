import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import { createRequire } from 'node:module';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import db from './persistence/index';
import getItems from './routes/getItems';
import addItem from './routes/addItem';
import updateItem from './routes/updateItem';
import deleteItem from './routes/deleteItem';
import getCategories from './routes/getCategories';
import addCategory from './routes/addCategory';
import addItemToCategory from './routes/addItemToCategory';
import removeItemFromCategory from './routes/removeItemFromCategory';
import updateItemPriority from './routes/updateItemPriority';

const require = createRequire(import.meta.url);
const sqliteStoreFactory = require('express-session-sqlite').default;

dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_LOCATION = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${BACKEND_URL}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await db.getOrCreateUser({
        id: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const app = express();

app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true,
    }),
);


/*
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,        // true only in production with HTTPS
    sameSite: 'lax',     // 'lax' for localhost, 'none' for cross-site in production
  }
})); */



// replacing memory store to accomodate the 3 backends for nginx implementation
const SQLiteStore = sqliteStoreFactory(session);
const sessionStore = new SQLiteStore({
  driver: sqlite3.Database,
  path: process.env.SESSION_DB_LOCATION || '/app/data/sessions.db',
  ttl: 24 * 60 * 60 * 1000, // 1 day
  cleanupInterval: 5 * 60 * 1000, // every 5 min
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // localhost over http
      sameSite: 'lax',
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(CLIENT_ORIGIN);
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/auth/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

app.get('/items', requireAuth, getItems);
app.post('/items', requireAuth, addItem);
app.put('/items/:id', requireAuth, updateItem);
app.delete('/items/:id', requireAuth, deleteItem);

app.get('/categories', requireAuth, getCategories);
app.post('/categories', requireAuth, addCategory);
app.post('/items/:itemId/categories', requireAuth, addItemToCategory);
app.delete('/items/:itemId/categories', requireAuth, removeItemFromCategory);

app.put('/items/:id/priority', requireAuth, updateItemPriority);

db.init(DB_LOCATION)
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => console.log('Listening on port 3000'));
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => {
            console.log('Shutdown complete.');
            process.exit(0);
        });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
