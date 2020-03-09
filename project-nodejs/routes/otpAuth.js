const router = require('express').Router();
const User = require('../model/User');
const verify = require('../middleware/verfyToken');


router.get('/otp', verify, (req, res) => {
    res.render("../views/otp")
});


module.exports = router;