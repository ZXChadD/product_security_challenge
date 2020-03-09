const router = require('express').Router();
const User = require('../model/User');
const Blacklist = require('../model/Blacklist');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const fs = require('fs');

const {
    registerValidation,
    loginValidation
} = require('../validation')

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/register', async (req, res) => {

    let username = req.sanitize(req.body.name)
    let email = req.sanitize(req.body.email)
    let password = req.sanitize(req.body.password)
    let confirmPassword = req.sanitize(req.body.confirmPassword)


    //Check for common password
    fs.readFile("./cp.txt", function (error, data) {
        let cp = data.toString().split("\n")
        if (error) return res.status(400).json({
            message: "Please try again later"
        });
        cp.forEach(element => {
            if (element === password.toLowerCase()) {
                return res.status(400).json({
                    message: "Please use another password"
                })
            }
        })
    })

    //Validation
    const {
        error
    } = registerValidation(req.body);
    if (error) return res.status(400).json({
        message: error.details[0].message
    })

    //Check if user exists 
    const userExists = await User.findOne({
        name: username
    });
    if (userExists) return res.status(400).json({
        message: "User already exists"
    });

    //Check if email exists
    const emailExists = await User.findOne({
        email: email
    });
    if (emailExists) return res.status(400).json({
        message: "Email already used"
    });

    //Check if passwords are the same
    if (password !== confirmPassword) return res.status(400).json({
        message: "Passwords are different"
    })

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt)

    //Create user
    const user = new User({
        name: username,
        email: email,
        password: hashPassword
    });
    try {
        const saveUser = await user.save();
        res.status(200).json({
            message: "Registered Successfully"
        });
    } catch (err) {
        res.status(400).json({
            message: err
        });
    }
});

router.post('/login', async (req, res) => {

    let username = req.sanitize(req.body.name)
    let password = req.sanitize(req.body.password)

    //Validation
    const {
        error
    } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    //Check if user exists 
    const userExists = await User.findOne({
        name: username
    });
    if (!userExists) return res.status(400).json({
        message: "Username or password is wrong"
    });

    //If the account is suspended
    if (userExists.numOfTries === 5 && Date.now() < userExists.accountLogout) {
        return res.status(400).json({
            message: "Please try again later."
        });
    }

    //Check if password is correct
    const validPass = await bcrypt.compare(password, userExists.password);
    if (!validPass) {
        userExists.numOfTries = userExists.numOfTries + 1;


        //After the 5th try logout for 1/2 and hour
        if (userExists.numOfTries == 5) {
            let accountLogoutTime = Date.now() + 1200000;
            userExists.accountLogout = accountLogoutTime;
            userExists.save()
            return res.status(400).json({
                message: "Your account has been suspended for 20 mins. Please try again later."
            });
        }

        userExists.save()

        return res.status(400).json({
            message: "Invalid password"
        });
    }

    const payload = {
        username: userExists.name,
        expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),

    };

    userExists.numOfTries = 0
    userExists.accountLogout = undefined
    await userExists.save()

    //Create token
    const token = jwt.sign(JSON.stringify(payload), process.env.SECRET)

    //Store JWT in cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
    });

    sendEmail(userExists, res);
})

router.post('/logout', async (req, res) => {
    const token = req.cookies.token
    res.clearCookie("token");
    //Add token to blacklist
    const blacklist = new Blacklist({
        token: token,
    });
    try {
        await blacklist.save();
        res.status(200).redirect("/login");
    } catch (err) {
        res.status(400).redirect("/login");
    }
})

async function sendEmail(user, res) {
    if (Date.now() > user.otpLimit) {

        //Generate OTP
        user.generateOTP();

        // Save the updated user object
        await user.save();

        const mailOptions = {
            to: user.email,
            from: process.env.FROM_EMAIL,
            subject: "OTP",
            text: `Hi ${user.name} \n 
        Here is your otp ${user.otp}. \n\n`
        };

        sgMail.send(mailOptions, (error, result) => {
            // if (error) return res.status(500).json({
            //     message: "Enable to send email"
            // });

            return res.status(200).json({
                message: 'Otp has been sent to ' + user.email + '.'
            });
        });

    } else {
        return res.status(500).json({
            message: "Please login again"
        });
    }

}

module.exports = router;