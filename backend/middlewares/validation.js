const {body} = require('express-validator')


const validateRegistration = [
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({ min: 6 }).notEmpty().withMessage("Password is required"),
    body('name').notEmpty()
];

const validateLogin = [
    body('email').isEmail().withMessage("Please provide a valid email"),
    body('password').isLength({ min: 6 }).notEmpty().withMessage("Password is required")
];

const validateForgotPassword = [
    body('email').isEmail().withMessage("Please provide a valid email")
];

const validateResetPassword = [
    body('newPassword').isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

module.exports = { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword };