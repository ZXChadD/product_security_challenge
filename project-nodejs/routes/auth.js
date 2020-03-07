const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const {registerValidation, loginValidation} = require('../validation')

dotenv.config();


router.post('/register', async (req,res) => {

    //Validation
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message)

    //Check if user exists 
    const userExists = await User.findOne({name: req.body.name});
    if(userExists) return res.status(400).send("User already exists");

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    //Create user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });
    try{
        const saveUser = await user.save();
        res.send({user: user.name});
    }catch(err){
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {

    //Validation
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message)

    //Check if user exists 
    const userExists = await User.findOne({name: req.body.name});
    if (!userExists) return res.status(400).send("User or password is wrong");

    //Check if password is correct

    const validPass = await bcrypt.compare(req.body.password, userExists.password);
    if(!validPass) return res.status(400).send("Invalid password")

    //Create token
    const token = jwt.sign({_id: userExists._id}, process.env.SECRET)
    res.header('auth-token', token).send(token)

    // res.send("Login successful")
})

module.exports = router;