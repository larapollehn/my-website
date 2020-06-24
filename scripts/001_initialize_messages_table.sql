CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sendername VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    subject VARCHAR(100),
    message VARCHAR(512) NOT NULL,
    senddate DATE NOT NULL,
    sendertoken VARCHAR(100) UNIQUE,
    senderip VARCHAR(15)
);