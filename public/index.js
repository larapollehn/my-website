function sendMail() {
    const token = grecaptcha.getResponse();
    const sendername = 'Jane Doe';
    const sendermail = 'jane@doe.de';
    const subject = 'test mail';
    const message = 'Hello this is a test mail to test the mail service';

    axios({
        method: 'POST',
        url: '/api/contact',
        data: {
            'token': token,
            'sendername': sendername,
            'sendermail': sendermail,
            'subject': subject,
            'message': message
        }
    }).then((response) => {
        console.log('Verification is a success',response.data);
    }).catch((error) => {
        console.log('Verification NOT a success',error.response);
    })
}