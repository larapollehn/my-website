const express = require("express");
const {
 verifyRecaptcha, sendEmail, activateWebHook, saveMessage,
} = require("../services/ContactServices");

const contactRouter = express.Router();
contactRouter.post("/contact", verifyRecaptcha, sendEmail, activateWebHook, saveMessage);

module.exports = contactRouter;
