ALTER TABLE user
    MODIFY COLUMN user_id VARCHAR(30) UNIQUE,
    MODIFY COLUMN username VARCHAR(30) UNIQUE,
    MODIFY COLUMN hashed_password VARCHAR(512);