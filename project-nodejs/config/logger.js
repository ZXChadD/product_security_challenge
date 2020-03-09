const dotenv = require('dotenv')
dotenv.config();

const {
    createLogger,
    transports,
    format
} = require('winston');
require('winston-mongodb');
const logger = createLogger({
    transports: [
        new transports.MongoDB({
            level: 'info',
            db: process.env.DB_CONNECT,
            options: {
                useUnifiedTopology: true
            },
            collection: 'logs',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
    // meta: true,
    // msg: "Request: HTTP {{req.method}} {{req.url}}; Username: {{req.user.preferred_username}}; ipAddress {{req.connection.remoteAddress}}",
    // requestWhitelist: [
    //     "url",
    //     "method",
    //     "httpVersion",
    //     "originalUrl",
    //     "query",
    //     "body"
    // ]
})



module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};