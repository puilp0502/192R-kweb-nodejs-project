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

exports.processQuery = processQuery;
