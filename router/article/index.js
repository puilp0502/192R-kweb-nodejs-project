const express = require('express');
const router = express.Router();

const articleCtrl = require('./article.ctrl');

router.get('/:articleId(\\d+)', articleCtrl.readArticle);

router.get('/compose', articleCtrl.writeArticleForm);

router.post('/compose', articleCtrl.writeArticle);

router.get('/edit/:articleId(\\d+)', articleCtrl.editArticleForm);

router.post('/edit/:articleId(\\d+)', articleCtrl.editArticle);

router.get('/delete/:articleId(\\d+)', articleCtrl.deleteArticle);

module.exports = router;
