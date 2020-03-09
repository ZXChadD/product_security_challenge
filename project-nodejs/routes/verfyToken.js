const jwt = require('jsonwebtoken')
const Blacklist = require('../model/Blacklist');


module.exports = async function auth (req, res, next){
    const token = req.cookies.token

    //If token does not exist
    if(!token) return res.status(400).redirect("/login")

    //If token has not been blacklisted 
    const tokenExists = await Blacklist.findOne({token: token});
    if(tokenExists) return res.status(400).redirect("/login")

    try {
        const payload = jwt.verify(token, process.env.SECRET)

        //Check if the token has expired 
        if (Date.now() > payload.expires) {
            res.status(400).redirect("/login")
        }
        next();
    } catch(err){
        res.status(400).redirect("/login")
    }
}