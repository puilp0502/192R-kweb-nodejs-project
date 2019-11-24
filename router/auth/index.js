const express = require('express');
const router = express.Router();

const authCtrl = require('./auth.ctrl');


router.get('/login', authCtrl.loginForm);
router.post('/login', authCtrl.login);

router.get('/register', authCtrl.registerForm);
router.post('/register', authCtrl.register);

// In production, ALWAYS use POST for destructive action!
router.get('/logout', authCtrl.logout);
module.exports = router;
