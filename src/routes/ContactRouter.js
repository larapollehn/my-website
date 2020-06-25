const express = require('express');
const contactService = require('./../services/ContactServices');

const contactRouter = express.Router();

contactRouter.post('/contact', contactService.sendMail)

module.exports = contactRouter;