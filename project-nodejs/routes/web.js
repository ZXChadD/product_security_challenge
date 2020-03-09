const router = require('express').Router();
const verify = require('../middleware/verfyToken');
const User = require('../model/User');

router.get('/home', verify, (req, res) => {
    res.render("../views/home")
});

router.get('/login', (req, res) => {
    res.render("../views/login");
});

router.get('/register', (req, res) => {
    res.render("../views/register");
});

router.get('/forgetpassword', (req, res) => {
    res.render("../views/forgetPassword");
});

router.get('/resetpassword/:token', (req, res) => {
    User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        })
        .then((user) => {
            if (!user) return res.status(401).json({
                message: 'Password reset token is invalid or has expired.'
            });
            let token = req.params.token;

            //Redirect user to form with the email address
            res.render("../views/resetPassword", {
                token: token
            });
        })
        .catch(err => res.status(500).json({
            message: err.message
        }));
});

module.exports = router;