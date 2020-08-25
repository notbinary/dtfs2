import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import path from 'path';
import crypto from 'crypto';
import json2csv from 'express-json2csv';
import './azure-env';
import routes from './routes';
import healthcheck from './healthcheck';

import configureNunjucks from './nunjucks-configuration';

const app = express();

const PORT = process.env.PORT || 5000;

// Fail-safe fallback to a 256-bit random value:
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(256 / 8).toString('hex');

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(cookieParser()); // could optionally use a secret here
app.use(flash());
app.use(json2csv);

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(express.urlencoded());

app.use(morgan('dev', {
  skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
}));

app.use(healthcheck);

app.use('/', routes);

app.use(express.static('dist'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);
app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`)); // eslint-disable-line no-console