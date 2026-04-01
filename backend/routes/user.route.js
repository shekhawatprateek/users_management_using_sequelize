const express = require('express');
const {registerUser, verifyEmail, loginUser, forgotPassword, resetPassword, getUsers, updateProfile, getUserById, deleteUser} = require('../controllers/user.controller')
const { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword } = require('../middlewares/validation');
const multer = require('multer');
const { protect, adminOnly } = require('../middlewares/auth');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// 2. Add the protected GET route
router.get('/', protect, getUsers);

router.post('/register', 
    upload.single('profileImage'),
    validateRegistration,
    registerUser)

router.get('/verify', verifyEmail);

router.post('/login', validateLogin, loginUser);

router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:id/:token', validateResetPassword, resetPassword);

// Add these with your other protected routes

// 1. Update own profile (Requires Auth + Multer)
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

// 2. View a specific user's profile (Requires Auth)
router.get('/:id', protect, getUserById);

// Add this DELETE route
// Notice how it has to pass through `protect` first, then `adminOnly`, before hitting `deleteUser`
router.delete('/:id', protect, adminOnly, deleteUser);


module.exports = router;