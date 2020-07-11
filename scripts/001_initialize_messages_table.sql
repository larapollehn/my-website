CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sendername VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    subject VARCHAR(100),
    message VARCHAR(512) NOT NULL,
    senddate DATE NOT NULL,
    sendertoken VARCHAR(100),
    senderip VARCHAR(15)
);

ALTER TABLE messages ALTER COLUMN sendertoken TYPE varchar(512);

ALTER TABLE messages ALTER COLUMN senderip TYPE varchar(64);
