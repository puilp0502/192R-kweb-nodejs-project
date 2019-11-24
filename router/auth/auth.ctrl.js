const crypto = require('crypto');
const util = require('util');
const dbPool = require('../../lib/dbPool');
const processQuery = dbPool.processQuery;

const pbkdf2 = util.promisify(crypto.pbkdf2);
const randomBytes = util.promisify(crypto.randomBytes);
const KEY_LEN = 64;

async function comparePassword(password, stored_password) {
	const [algo, encoded_salt, iter_str, keylen_str, encoded_digest] = stored_password.split(':');
	const iter = parseInt(iter_str);
	const keylen = parseInt(keylen_str);
	const salt = new Buffer(encoded_salt, 'base64');
	const digest = new Buffer(encoded_digest, 'base64');
	const hashed = await pbkdf2(password, salt, iter, keylen, algo);
	return Buffer.compare(hashed, digest) === 0;
}

async function generatePassword(password) {
	const ITER = 100000;
	const ALGO = 'sha512';
	const salt = await randomBytes(16);
	const digest = await pbkdf2(password, salt, ITER, KEY_LEN, ALGO);
	return `${ALGO}:${salt.toString('base64')}:${ITER}:${KEY_LEN}:${digest.toString('base64')}`
}

exports.loginForm = (req, res) => {
	if (req.session.user) {
		res.redirect("/");
	} else {
		res.render('login.ejs');
	}
};

exports.login = async (req, res) => {
	try {
		const id = req.body.id;
		const password = req.body.pw;
		const sql = 'SELECT pk, user_id, username, is_active, hashed_password, is_staff FROM user WHERE user_id=?';
		let result = await processQuery(sql, [id]);
		if (result.length === 0) {
			return res.send("<script>alert(\"Invalid credential; try again.\");history.back();</script>");
		} else {
			const user = result[0];
			const hashed_password = user.hashed_password;
			const password_equal = await comparePassword(password, hashed_password);
			if (!password_equal) {
				return res.send("<script>alert(\"Invalid credential; try again.\");history.back();</script>");
			}
			req.session.user = {
				pk: user.pk,
				user_id: user.user_id,
				username: user.username,
				is_active: user.is_active,
				is_staff: user.is_staff,
			};
			return res.redirect('/');
		}
	} catch (e) {
		console.error(e);
		res.status(500);
		res.send("There was an error processing your request.");
	}
};

exports.registerForm = async (req, res) => {
	res.render("register.ejs");
};

exports.register = async (req, res) => {
	const id = req.body.id;
	const password = req.body.pw;
	const username = req.body.nickname;
	try {
		if (!id || !password || !username) {
			res.send('<script>alert("Some of the fields are missing");history.back();</script>');
		} else {
			const hashed_password = await generatePassword(password);
			const sql = 'INSERT INTO user (user_id, username, hashed_password, is_active) ' +
				'VALUES (?, ?, ?, 1)';
			let result = await processQuery(sql, [id, username, hashed_password]);
			res.redirect('/auth/login');
		}
	} catch (e) {
		console.error(e);
		res.status(500);
		res.send("There was an error processing your request.");
	}
};

exports.logout = (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error(err);
			res.status(500).send("There was an error processing your request.");
		}
	});
	res.redirect('/auth/login');
};
