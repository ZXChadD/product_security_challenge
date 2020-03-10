const Joi = require('@hapi/joi')
const PasswordComplexity = require('joi-password-complexity')

const complexityOptions = {
    min: 8,
    max: 250,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 0,
};
//Register Validation 
const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: PasswordComplexity(complexityOptions).required(),
        confirmPassword: Joi.string().min(8).required(),
    }, {escapeHtml: true});
    return schema.validate(data);
}

//Reset Password
const resetPasswordValidation = (data) => {
    const schema = Joi.object({
        password: PasswordComplexity(complexityOptions).required(),
        confirmPassword: Joi.string().min(8).required(),
        resetToken: Joi.string().required(),
    }, {escapeHtml: true});
    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        password: Joi.string().required()
    });
    return schema.validate(data);
}


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.resetPasswordValidation = resetPasswordValidation;