CREATE TABLE article(
	pk INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	title VARCHAR(40),
	content TEXT,
	author INT,
	created_at TIMESTAMP,
	last_updated TIMESTAMP,
	is_active TINYINT,
	is_deleted TINYINT
) CHARSET UTF8 COLLATE utf8_general_ci;

