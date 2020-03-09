const router = require('express').Router();
const User = require('../model/User');
const Blacklist = require('../model/Blacklist');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const logger = require('../config/logger')
const {registerValidation, loginValidation} = require('../validation')

dotenv.config();

router.post('/register', async (req,res) => {

    let username = req.sanitize(req.body.name)
    let email = req.sanitize(req.body.email)
    let password = req.sanitize(req.body.password)
    let confirmPassword = req.sanitize(req.body.confirmPassword)


    //Validation
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).json({message:error.details[0].message})

    //Check if user exists 
    const userExists = await User.findOne({name: username});
    if(userExists) return res.status(400).json({message:"User already exists"});
    
    //Check if email exists
    const emailExists = await User.findOne({email: email});
    if(emailExists) return res.status(400).json({message:"Email already used"});

    //Check if passwords are the same
    if(password !== confirmPassword)return res.status(400).json({message:"Passwords are different"})

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt)

    //Create user
    const user = new User({
        name: username,
        email: email,
        password: hashPassword
    });
    try{
        const saveUser = await user.save();
        res.status(200).json({message: "Registered Successfully"});
    }catch(err){
        res.status(400).json({message: err});
    }
});

router.post('/login', async (req, res) => {

    let username = req.sanitize(req.body.name)
    let password = req.sanitize(req.body.password)

    //Validation
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message)

    //Check if user exists 
    const userExists = await User.findOne({name: username});
    if (!userExists) return res.status(400).json({message:"Username or password is wrong"});

    //Check if password is correct
    const validPass = await bcrypt.compare(password, userExists.password);
    if(!validPass) return res.status(400).json({message:"Invalid password"});

    const payload = {
        username: userExists.name,
        expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
      };

    //Create token
    const token = jwt.sign(JSON.stringify(payload), process.env.SECRET)

    //Store JWT in cookie
    res.cookie('token', token, {httpOnly: true, secure: true,});
    res.status(200).json({message: "Valid credentials", token: token})
})

router.post('/logout', async (req, res) => {
    const token = req.cookies.token
    res.clearCookie("token");    
    //Add token to blacklist
    const blacklist = new Blacklist({
        token: token,
    });
    try{
        await blacklist.save();
        res.status(200).redirect("/login");
    }catch(err){
        res.status(400).redirect("/login");
    }

    res.status(200).redirect("/login")
})

module.exports = router;