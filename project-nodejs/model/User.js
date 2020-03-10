const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrpt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 255,
        min: 6
    },
    password: {
        type: String,
        required: true,
        min: 8,
        min: 1024
    },
    date: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
    },
    numOfTries: {
        type: Number,
        required: true,
        default: 0
    },
    accountLogout: {
        type: Date,
        required: false
    },
    // otp: {
    //     type: Number,
    //     requried: false,
    // },
    // otpLimit:{
    //     type: Date,
    //     required:false,
    //     default:"2020-03-09T14:41:44.075+00:00"
    // },
    // otpRepeat: {
    //     type: Date,
    //     required:false
    // }

})


userSchema.methods.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

// userSchema.methods.generateOTP = function () {
//     // const salt = bcrypt.genSalt(10);
//     this.otp = Math.floor(Math.random() * 899999 + 100000);
//     this.otpLimit = Date.now() + 30000; //expires in 5 mins
// };


module.exports = mongoose.model('User', userSchema)