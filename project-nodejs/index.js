const express = require('express');
const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const path = require('path');
const cookierParser = require('cookie-parser')
const https = require('https');
const fs = require('fs');
const morgan = require('morgan');
const winston = require('winston');
const logger = require('./config/logger')
const csurf = require('csurf');
const helmet = require('helmet');
const expressSanitizer = require('express-sanitizer');


app.use(express.json())
app.use(express.urlencoded());

//Security packages
app.use(helmet());
app.use(expressSanitizer());

const csrfMiddleware = csurf({
  cookie: true
});


//Access cookies
app.use(cookierParser())
app.use(csrfMiddleware);

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
mongoose.connect(process.env.DB_CONNECT,
	{ useNewUrlParser: true },
	() => console.log('connected to db!')
);

//Route Middlewares
app.use('/api', authRoute);
app.use('/api', resetPasswordRoute);
app.use('', webRoute)

//Logging
app.use(morgan('combined', { stream: logger.stream }));

// Error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // add this line to include winston logging
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });


https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: process.env.PP
}, app).listen(3000, () => logger.info('Server Up and running'));