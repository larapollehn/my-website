const express = require('express');
const {verifyRecaptcha, sendEmail, saveMessage} = require("../services/ContactServices");

const contactRouter = express.Router();
contactRouter.post('/contact', verifyRecaptcha, sendEmail, saveMessage);

module.exports = contactRouter;
