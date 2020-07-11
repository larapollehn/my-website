const express = require('express');
import {verifyRecaptcha, sendEmail, saveMessage} from "../services/ContactServices";

const contactRouter = express.Router();
contactRouter.post('/contact', verifyRecaptcha, sendEmail, saveMessage);

export default contactRouter;
