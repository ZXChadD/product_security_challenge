const jwt = require('jsonwebtoken')
const Blacklist = require('../model/Blacklist');


module.exports = async function auth(req, res, next) {
    const token = req.cookies.token

    //If token exist
    //If token has not been blacklisted 
    const tokenBlacklisted = await Blacklist.findOne({
        token: token
    });
    if (token && !tokenBlacklisted) {

        try {
            const payload = jwt.verify(token, process.env.SECRET)

            //Check if the token has expired 
            if (Date.now() < payload.expires) {
                return res.status(302).redirect("/home")
            }
        } catch (err) {
            return res.status(400)
        }
    } else {
        next()
    }
}