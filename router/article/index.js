const express = require('express');
const router = express.Router();

const authRequired = require('../auth/middleware').authRequired;
const articleCtrl = require('./article.ctrl');

router.get('/:articleId(\\d+)', articleCtrl.readArticle);

router.get('/compose', authRequired, articleCtrl.writeArticleForm);

router.post('/compose', authRequired, articleCtrl.writeArticle);

router.get('/edit/:articleId(\\d+)', authRequired, articleCtrl.editArticleForm);

router.post('/edit/:articleId(\\d+)', authRequired, articleCtrl.editArticle);

router.get('/delete/:articleId(\\d+)', authRequired, articleCtrl.deleteArticle);

module.exports = router;
