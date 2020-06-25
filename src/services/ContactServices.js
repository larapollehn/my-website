const axios = require('axios');
const nodemailer = require("nodemailer");
const sqlAccess = require('../data/SQLAccess');
const RECAPTCHA_TOKEN = process.env.RECAPTCHA_TOKEN;
const EMAILPW = process.env.MAILPWD;
const SENDER = process.env.SENDER;
const RECEIVER = process.env.RECEIVER;
const HOST = process.env.HOST;
const MUST_VERIFY_MESSAGE = process.env.MUST_VERIFY_MESSAGE;

console.assert(RECEIVER !== null && RECEIVER !== undefined, "Email Receiver is not set. Did you set the environment variable properly?");
console.assert(SENDER !== null && SENDER !== undefined, "Email Sender is not set. Did you set the environment variable properly?");
console.assert(EMAILPW !== null && EMAILPW !== undefined, "Email Sender's password is not set. Did you set the environment variable properly?");
console.assert(HOST !== null && HOST !== undefined, "Email Sender's SMTP host is not set. Did you set the environment variable properly?");
console.assert(RECAPTCHA_TOKEN !== null && RECAPTCHA_TOKEN !== undefined, "Google reCaptcha2 Secret Token is not set. Did you set the environment variable properly?");
console.assert(MUST_VERIFY_MESSAGE !== null && MUST_VERIFY_MESSAGE !== undefined, "Flag mustVerifyToken is not set. Did you set the environment variable properly?");

const sendMail = (expressRequest, expressResponse) => {
    if (MUST_VERIFY_MESSAGE === 'true') {
        const obtainedToken = expressRequest.body["token"];
        axios.post('https://www.google.com/recaptcha/api/siteverify?' + 'secret=' + RECAPTCHA_TOKEN + '&response=' + obtainedToken)
            .then((googleResponse) => {
                if (googleResponse.data['success'] === true) {
                    processMessages(expressRequest, expressResponse);
                } else {
                    expressResponse.status(400).send('Verification not a success');
                }
            }).catch((error) => {
                expressResponse.status(500).send(JSON.stringify(error));
            });
    } else {
        processMessages(expressRequest, expressResponse);
    }
}

function processMessages(expressRequest, expressResponse) {
    notify(expressRequest, expressResponse).then(() => {
        saveMessage(expressRequest, expressResponse);
    }).catch((mailError) => {
        expressResponse.status(400).send(JSON.stringify(mailError));
    })
}

function notify(expressRequest, expressResponse) {
    const senderName = expressRequest.body['sendername'];
    const senderEmail = expressRequest.body['sendermail'];
    const subject = expressRequest.body['subject'];
    const message = expressRequest.body['message'];
    let transporter = nodemailer.createTransport({
        host: HOST,
        port: 587,
        secure: false,
        auth: {
            user: SENDER,
            pass: EMAILPW,
        },
    });

    return transporter.sendMail({
        from: SENDER,
        to: RECEIVER,
        subject: "Contact email from your website",
        text: `From: ${senderName} - Mail: ${senderEmail} - Subject: ${subject} - Message: ${message}`
    });

}

function saveMessage(expressRequest, expressResponse) {
    const obtainedToken = expressRequest.body["token"];
    const senderName = expressRequest.body['sendername'];
    const senderEmail = expressRequest.body['sendermail'];
    const subject = expressRequest.body['subject'];
    const message = expressRequest.body['message'];
    sqlAccess
        .query('INSERT INTO messages (sendername, email, subject, message, senddate, sendertoken, senderip) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [senderName, senderEmail, subject, message, new Date().toISOString(), obtainedToken, '0.0.0.0'],
        (error, result) => {
            if (error) {
                expressResponse.status(500).send("An error happened.")
            } else {
                expressResponse.status(201).send(`Message sent trough contact form was stored in database`);
            }
        }
    )
}

module.exports = {
    sendMail: sendMail
}