const axios = require('axios');
const nodemailer = require("nodemailer");

const secretToken = process.env.RECAPTCHA_TOKEN;
const emailPassword = process.env.MAILPWD;
const emailSender = process.env.SENDER;
const emailReceiver = process.env.RECEIVER;
const smtpHost = process.env.HOST;

console.assert(emailReceiver !== null && emailReceiver !== undefined, "Email Receiver is not set. Did you set the environment variable properly?");
console.assert(emailSender !== null && emailSender !== undefined, "Email Sender is not set. Did you set the environment variable properly?");
console.assert(emailPassword !== null && emailPassword !== undefined, "Email Sender's password is not set. Did you set the environment variable properly?");
console.assert(smtpHost !== null && smtpHost !== undefined, "Email Sender's SMTP host is not set. Did you set the environment variable properly?");
console.assert(secretToken !== null && secretToken !== undefined, "Google reCaptcha2 Secret Token is not set. Did you set the environment variable properly?");

const sendMail = (expressRequest, expressResponse) => {

    const obtainedToken = expressRequest.body["token"];
    console.assert(obtainedToken != null);
    const sendername = expressRequest.body['sendername'];
    const sendermail = expressRequest.body['sendermail'];
    const subject = expressRequest.body['subject'];
    const message = expressRequest.body['message'];

    axios.post('https://www.google.com/recaptcha/api/siteverify?' + 'secret=' + secretToken + '&response=' + obtainedToken)
        .then((googleResponse) => {
            if (googleResponse.data['success'] === true) {
                sendMail().then((mailResponse) => {
                    expressResponse.status(200).send(mailResponse);
                }).catch((mailError) => {
                    expressResponse.status(400).send(mailError);
                })
            } else {
                expressResponse.status(400).send('Verification not a success');
            }
        })
        .catch((error) => {
        expressResponse.status(500).send(JSON.stringify(error));
    });

    async function sendMail() {
        let transporter = nodemailer.createTransport({
            host: smtpHost,
            port: 587,
            secure: false,
            auth: {
                user: emailSender,
                pass: emailPassword,
            },
        });

        return await transporter.sendMail({
            from: emailSender,
            to: emailReceiver,
            subject: "Contact email from your website",
            text: `From: ${sendername} - Mail: ${sendermail} - Subject: ${subject} - Message: ${message}`
        });

    }
}

module.exports = {
    sendMail
}