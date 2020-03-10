const jwt = require('jsonwebtoken')
const Blacklist = require('../model/Blacklist');


module.exports = async function auth(req, res, next) {
    const token = req.cookies.token

    //If token does not exist
    if (!token) return res.status(400).redirect("/login")

    //If token has been blacklisted 
    const tokenBlacklisted = await Blacklist.findOne({
        token: token
    });
    if (tokenBlacklisted) return res.status(400).redirect("/login")

    try {
        const payload = jwt.verify(token, process.env.SECRET)

        //Check if the token has expired 
        if (Date.now() > payload.expires) {
            return res.status(400).redirect("/login")
        }
        next();
    } catch (err) {
        return res.status(400).redirect("/login")
    }
}