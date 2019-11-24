const dbPool = require('../../lib/dbPool');
const processQuery = dbPool.processQuery;

exports.readArticle = async (req, res) => {
    try {
        const articleId = parseInt(req.params.articleId);
        const sql = 'SELECT article.*, user.username FROM `article` INNER JOIN user ON article.author = user.pk' +
			' WHERE article.is_active=1 AND article.is_deleted=0 AND article.pk=?';
		let result = await processQuery(sql, [articleId]);
		if (result.length === 0) {
			res.sendStatus(404);
			return;
		}
		const mainArticle = result[0];

		// get previous article id
		let tmpId = articleId;
		do {
			result = await processQuery(sql, --tmpId);
		} while (result.length == 0 && tmpId > 0);
		const prevArticle = result[0];

		// get next article id
		tmpId = articleId;
		const maxId = await processQuery('SELECT max(pk) FROM article', []);
		do {
			result = await processQuery(sql, ++tmpId);
		} while (result.length == 0 && tmpId <= maxId);
		const nextArticle = result[0];

        res.render('articleDetails.ejs', {
			mainArticle: mainArticle,
			prevArticle: prevArticle,
			nextArticle: nextArticle,
			user: req.session.user,
		});
    } catch (e) {
        throw e;
    }
};

exports.writeArticleForm = (req, res) => {
	res.render('articleCompose.ejs', { article: null, user: req.session.user });
};

exports.writeArticle = async (req, res) => {
	const title = req.body.title.trim();
	const content = req.body.content.trim();

	if (!title || !content) {
		res.send('<script>alert("Title or content is empty");history.back();</script>');
	} else {
		const sql = 'INSERT INTO article VALUES (NULL, ?, ?, ?, NOW(), NOW(), 1, 0)'
		let result = await processQuery(sql, [title, content, req.session.user.pk]);
		res.redirect(`/article/${result.insertId}`);
	}
};

exports.editArticleForm = async (req, res) => {
	try {
		const articleId = parseInt(req.params.articleId);
		const sql = 'SELECT * FROM article WHERE is_active=1 AND is_deleted=0 AND pk=?'
		const result = await processQuery(sql, [articleId]);

		if (result.length === 0) res.sendStatus(404);
		else res.render('articleCompose.ejs', { article: result[0], user: req.session.user });
	} catch (e) {
		throw e;
	}
};

exports.editArticle = async (req, res) => {
	try {
		const articleId = req.params.articleId;
		const title = req.body.title.trim();
		const content = req.body.content.trim();
		if (!title || !content) {
			return res.send('<script>alert("Title or content is empty");history.back();</script>');
		}
		const select_sql = 'SELECT author FROM article WHERE pk=?';
		let result = await processQuery(select_sql, [articleId]);
		const article = result[0];
		if (article.author !== req.session.user.pk) {
			return res.send('<script>alert("Cannot edit others\' article");history.back();</script>');
		}
		const sql = 'UPDATE article SET title=?, content=?, last_updated=NOW() WHERE pk=?';
		await processQuery(sql, [title, content, articleId]);
		res.redirect(`/article/${articleId}`);

	} catch (e) {
		throw e;
	}
};

exports.deleteArticle = async (req, res) => {
	try {
		const articleId = req.params.articleId;
		let sql = 'SELECT * FROM article WHERE is_active=1 AND is_deleted=0 AND pk=?';
		let result = await processQuery(sql, [articleId]);

		if (result.length === 0) {
			return res.sendStatus(404);
		}
		if (result[0].author !== req.session.user.pk) {
			return res.send('<script>alert("Cannot delete others\' article");history.back();</script>');
		}
		sql = 'UPDATE article SET title="", content="", is_deleted=1 WHERE pk=?';
		await processQuery(sql, [articleId]);
		res.redirect('/articles/page/1');

	} catch (e) {
		throw e;
	}
};
