const express = require('express');
const {registerUser, verifyEmail, loginUser, forgotPassword, resetPassword, getUsers, updateProfile, getUserById, deleteUser, refreshAccessToken} = require('../controllers/user.controller')
const { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword } = require('../middlewares/validation');
const multer = require('multer');
const { protect, adminOnly } = require('../middlewares/auth');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/', protect, getUsers);

router.post('/register', 
    upload.single('profileImage'),
    validateRegistration,
    registerUser)

router.get('/verify', verifyEmail);

router.post('/login', validateLogin, loginUser);

router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:id/:token', validateResetPassword, resetPassword);

router.put('/profile', protect, upload.single('profileImage'), updateProfile);

router.get('/:id', protect, getUserById);

router.delete('/:id', protect, adminOnly, deleteUser);

router.post('/refresh', refreshAccessToken);


module.exports = router;