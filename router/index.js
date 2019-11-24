const express = require('express');
const router = express.Router();

const indexCtrl = require('./index.ctrl');
const article = require('./article');
const auth = require('./auth');

router.get('/', indexCtrl.indexPage);

router.get('/articles/page/:pageNum(\\d+)', indexCtrl.listArticles);

router.get('/articles', indexCtrl.latestArticles);

router.use('/article', article);

router.use('/auth', auth);

module.exports = router;
