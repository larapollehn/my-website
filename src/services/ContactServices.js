const axios = require('axios');
const nodemailer = require("nodemailer");
import sqlAccess from '../data/SQLAccess';
import log from "../log/Logger";

const RECAPTCHA_TOKEN = process.env.RECAPTCHA_TOKEN;
const EMAILPW = process.env.MAILPWD;
const SENDER = process.env.SENDER;
const RECEIVER = process.env.RECEIVER;
const HOST = process.env.HOST;
const MUST_VERIFY_MESSAGE = process.env.MUST_VERIFY_MESSAGE;

/**
 * tranporter instance for sending mails with func notify
 */
const transporter = nodemailer.createTransport({
    host: HOST,
    port: 587,
    secure: false,
    auth: {
        user: SENDER,
        pass: EMAILPW,
    },
});

console.assert(RECEIVER !== null && RECEIVER !== undefined, "Email Receiver is not set. Did you set the environment variable properly?");
console.assert(SENDER !== null && SENDER !== undefined, "Email Sender is not set. Did you set the environment variable properly?");
console.assert(EMAILPW !== null && EMAILPW !== undefined, "Email Sender's password is not set. Did you set the environment variable properly?");
console.assert(HOST !== null && HOST !== undefined, "Email Sender's SMTP host is not set. Did you set the environment variable properly?");
console.assert(RECAPTCHA_TOKEN !== null && RECAPTCHA_TOKEN !== undefined, "Google reCaptcha2 Secret Token is not set. Did you set the environment variable properly?");
console.assert(MUST_VERIFY_MESSAGE !== null && MUST_VERIFY_MESSAGE !== undefined, "Flag mustVerifyToken is not set. Did you set the environment variable properly?");
log.debug("Contact service with receiver:", RECEIVER);
log.debug("Contact service with sender:", SENDER);
log.debug("Contact service with password:", EMAILPW);
log.debug("Contact service with SMTP host:", HOST);
log.debug("Contact service with recaptcha's secret:", RECAPTCHA_TOKEN);
log.debug("Contact service with receiver's email:", MUST_VERIFY_MESSAGE);

/**
 * verifies user with reCaptcha and processes contact message if successful
 * @param expressRequest contains google recaptcha token and user input from contact form
 * @param expressResponse
 */
export const verifyRecaptcha = async (expressRequest, expressResponse, next) => {
    log.debug("Incoming message for owner from contact form");
    if (MUST_VERIFY_MESSAGE === 'true') {
        log.debug("Incoming message must be verified. Verification now.");
        const obtainedToken = expressRequest.body["token"]; //token for verifying with google recaptcha
        log.debug("Obtained token to verify", obtainedToken);

        // post to google to verify user
        try {
            const googleResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify?' + 'secret=' + RECAPTCHA_TOKEN + '&response=' + obtainedToken);
            log.debug("Message verified successfully", googleResponse.data);
            if (googleResponse.data['success'] === true) {
                next();
            } else {
                return expressResponse.status(400).send('Verification not a success');
            }
        }catch(e){
            log.debug("Message can not be verified", googleResponse.data);
            return expressResponse.status(400).send('Verification not a success');
        }
    } else {
        log.warn("The current mode allows every message to reach the user. If this is not intended, please turn the filter on to avoid spam.");
        log.debug("Incoming message does not have to be verified. Process to save message in database and send message to owner");
        next();
    }
}

/**
 * uses func notify to send mail to website owner with nodemailer
 * if successful the message is saved to the database
 * @param expressRequest contains message from contact form
 * @param expressResponse
 */
export async function sendEmail(expressRequest, expressResponse, next) {
    try {
        const senderName = expressRequest.body['sendername'];
        const senderEmail = expressRequest.body['sendermail'];
        const subject = expressRequest.body['subject'];
        const message = expressRequest.body['message'];

        await transporter.sendMail({
            from: SENDER,
            to: RECEIVER,
            subject: "Contact email from your website",
            text: `From: ${senderName} \n Mail: ${senderEmail} \n Subject: ${subject} \n Message: ${message}`
        });
        next();
    }catch (e) {
        log.error("Notifying user failed. Following error was sent back: ", e);
        expressResponse.status(400).send(JSON.stringify(e));
    }
}

/**
 * message is saved in database
 * @param expressRequest
 * @param expressResponse
 */
export async function saveMessage(expressRequest, expressResponse) {
    const obtainedToken = expressRequest.body["token"];
    const senderName = expressRequest.body['sendername'];
    const senderEmail = expressRequest.body['sendermail'];
    const subject = expressRequest.body['subject'];
    const message = expressRequest.body['message'];
    const ip = expressRequest.connection.remoteAddress;
    log.debug("Following message was sent to user and will be persisted: ", ip, senderName, senderEmail, subject, message);
    try {
        await sqlAccess.query({
            name: "new-message",
            text: 'INSERT INTO messages (sendername, email, subject, message, senddate, sendertoken, senderip) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            values: [senderName, senderEmail, subject, message, new Date().toISOString(), obtainedToken, ip]
        });
        log.debug("Message persisted successful.");
        expressResponse.status(201).send(`Message sent trough contact form was stored in database`);
    }catch(error){
        log.error("Message could not be persisted, error: ", error);
        expressResponse.status(500).send("An error happened.")
    }
}
