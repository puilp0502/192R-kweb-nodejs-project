const mysqlDB = require('../database/db.config')();
const pool = mysqlDB.init();

async function processQuery(query, data) {
	try {
		const conn = await pool.getConnection();
		try {
            const sql = conn.format(query, data);
            const [result] = await conn.query(sql);
			conn.release();
			return result;
		} catch (e) {
			conn.release();
			throw e;
		}
	} catch (e) {
		throw (e);
	}
}

exports.indexPage = (req, res) => {
    res.render('index.ejs')
};

exports.listArticles = async (req, res) => {
    try {
        const pageNum = parseInt(req.params.pageNum);
        if (pageNum <= 0) {
            res.sendStatus(404);
            return;
        }

        const articlesPerPage = 20;
        const sql = 'SELECT * FROM `article` WHERE is_active=1 AND is_deleted=0 ORDER BY pk DESC';
        const result = await processQuery(sql);

        const maxPageNum = Math.ceil(result.length / articlesPerPage);
        
        if (pageNum > maxPageNum) {
            res.sendStatus(404);
            return;
        }

        const articles = result.slice(articlesPerPage * (pageNum - 1), articlesPerPage * pageNum);
        res.render('articlesIndex.ejs', { 
            page: pageNum, 
            articles: articles,
            hasPrev: (pageNum > 1), 
            hasNext: (pageNum < maxPageNum),
        });
    } catch (e) {
        throw e;
    }
};

exports.latestArticles = (req, res) => {
    res.redirect('/articles/page/1')
};