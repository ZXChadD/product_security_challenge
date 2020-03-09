const router = require('express').Router();
const User = require('../model/User');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')

const {resetPasswordValidation} = require('../validation')
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// @route POST api/forget
router.post('/forget', (req, res) => {
    let email = req.sanitize(req.body.email)

    User.findOne({ email: email })
        .then(async (user) => {
            if (!user) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });

            //Generate and set password reset token
            user.generatePasswordReset();

            // Save the updated user object
            await user.save()
                .then(user => {
                    // send email
                    let link = "https://" + req.headers.host + "/resetpassword/" + user.resetPasswordToken;
                    const mailOptions = {
                        to: user.email,
                        from: process.env.FROM_EMAIL,
                        subject: "Password change request",
                        text: `Hi ${user.name} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                    };

                    sgMail.send(mailOptions, (error, result) => {
                        if (error) return res.status(500).json({ message: "Enable to send email"});

                        res.status(200).json({ message: 'A reset email has been sent to ' + user.email + '.' });
                    });
                })
                .catch(err => res.status(500).json({ message: err.message}));
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

// @route POST api/reset
router.post('/reset', async (req, res) => {
    await User.findOne({resetPasswordToken: req.body.resetToken, resetPasswordExpires: {$gt: Date.now()}})
        .then(async (user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

            let password = req.sanitize(req.body.password)
            let confirmPassword = req.sanitize(req.body.confirmPassword)

            //Validation
            const {error} = resetPasswordValidation(req.body);
            if(error) return res.status(400).send(error.details[0].message)

            //Check if passwords are the same
            if(password !== confirmPassword) return res.status(400).json({message:"Passwords are different"})

            //Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt)

            //Set the new password
            user.password = hashPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // Save
            user.save((err) => {
                if (err) return res.status(500).json({message: err.message});

                // send email
                const mailOptions = {
                    to: user.email,
                    from: process.env.FROM_EMAIL,
                    subject: "Your password has been changed",
                    text: `Hi ${user.name} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                };

                sgMail.send(mailOptions, (error, result) => {
                    if (error) return res.status(500).json({message: error.message});
                
                    res.status(200).json({message: 'Your password has been updated.'});
                });
            });
        });
});


module.exports = router;