const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const router = require('./router');

const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

app.use((req, res, next) => {
	next(createError(404));
});

app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.send(`${err.message} ${err.status}<br>${err.stack}`);
});

module.exports = app;
