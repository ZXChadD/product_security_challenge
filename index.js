const express = require('express');
const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const path = require('path');
const cookierParser = require('cookie-parser')
const https = require('https');
const fs = require('fs');
const morgan = require('morgan');
const logger = require('./config/logger')
const csurf = require('csurf');
const csrfCheck = csurf();
const helmet = require('helmet');
const expressSanitizer = require('express-sanitizer');
const rateLimit = require('express-rate-limit');

//Logging
app.use(morgan("combined", {
  "stream": logger.stream
}));


app.use(express.json())
app.use(express.urlencoded());

//Security packages
app.use(helmet());
app.use(expressSanitizer());

//Access cookies
app.use(cookierParser())

//Import Routes
const authRoute = require('./routes/auth');
const webRoute = require('./routes/web');
const resetPasswordRoute = require('./routes/resetPassword');

//Views
app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "pug");

//Serve static files from /public
app.use(express.static(__dirname + '/public'));

//Serve js files from /public
app.use(express.static(path.join(__dirname, 'node_modules')));

//Access .env file 
dotenv.config();

//Connect to DB
mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true
  },
  () => console.log('connected to db!')
);

//Route Middlewares
app.use('/api', authRoute);
app.use('/api', resetPasswordRoute);
app.use('', webRoute);
app.all('*', function(req, res) {
  res.redirect("/login");
});

//Rate Limiter
const rateLimiter= rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 50,
  message: 'You have exceeded the number of requests',
  headers: true,
});

app.use(csrfCheck, (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(rateLimiter);

https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: process.env.PP
}, app).listen(process.env.PORT || 3000, () => console.log('Server Up and running'));