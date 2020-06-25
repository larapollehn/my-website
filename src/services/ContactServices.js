const axios = require('axios');
const nodemailer = require("nodemailer");
const sqlAccess = require('../data/SQLAccess');
const RECAPTCHA_TOKEN = process.env.RECAPTCHA_TOKEN;
const EMAILPW = process.env.MAILPWD;
const SENDER = process.env.SENDER;
const RECEIVER = process.env.RECEIVER;
const HOST = process.env.HOST;
const MUST_VERIFY_MESSAGE = process.env.MUST_VERIFY_MESSAGE;
const log = require("../log/Logger");

console.assert(RECEIVER !== null && RECEIVER !== undefined, "Email Receiver is not set. Did you set the environment variable properly?");
console.assert(SENDER !== null && SENDER !== undefined, "Email Sender is not set. Did you set the environment variable properly?");
console.assert(EMAILPW !== null && EMAILPW !== undefined, "Email Sender's password is not set. Did you set the environment variable properly?");
console.assert(HOST !== null && HOST !== undefined, "Email Sender's SMTP host is not set. Did you set the environment variable properly?");
console.assert(RECAPTCHA_TOKEN !== null && RECAPTCHA_TOKEN !== undefined, "Google reCaptcha2 Secret Token is not set. Did you set the environment variable properly?");
console.assert(MUST_VERIFY_MESSAGE !== null && MUST_VERIFY_MESSAGE !== undefined, "Flag mustVerifyToken is not set. Did you set the environment variable properly?");
log.debug("Contact service with receiver", RECEIVER);
log.debug("Contact service with sender", SENDER);
log.debug("Contact service with password", EMAILPW);
log.debug("Contact service with SMTP host", HOST);
log.debug("Contact service with recaptcha's secret", RECAPTCHA_TOKEN);
log.debug("Contact service with receiver's email", MUST_VERIFY_MESSAGE);

const sendMail = (expressRequest, expressResponse) => {
    log.debug("Incoming message for owner from contact form");
    if (MUST_VERIFY_MESSAGE === 'true') {
        log.debug("Incoming message must be verified. Verification now.");
        const obtainedToken = expressRequest.body["token"];
        log.debug("Obtained token to verify", obtainedToken);
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
        log.debug("Incoming message does not have to be verified. Process to save message in database and send message to owner");
        processMessages(expressRequest, expressResponse);
    }
}

function processMessages(expressRequest, expressResponse) {
    notify(expressRequest, expressResponse).then(() => {
        log.debug("Notifying user is successful. Process to save Message");
        saveMessage(expressRequest, expressResponse);
    }).catch((mailError) => {
        log.debug("Notifying user failed. Following error was sent back: ", mailError);
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
    const ip = expressRequest.connection.remoteAddress;
    log.debug("Following message was sent to user and will be persisted: ", ip, senderName, senderEmail, subject, message);
    sqlAccess
        .query('INSERT INTO messages (sendername, email, subject, message, senddate, sendertoken, senderip) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [senderName, senderEmail, subject, message, new Date().toISOString(), obtainedToken, ip],
            (error, result) => {
                if (error) {
                    log.debug("Message could not be persisted, error: ", error);
                    expressResponse.status(500).send("An error happened.")
                } else {
                    log.debug("Message persisted successful.");
                    expressResponse.status(201).send(`Message sent trough contact form was stored in database`);
                }
            }
        )
}

module.exports = {
    sendMail: sendMail
}