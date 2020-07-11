require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const sqlAccess = require('./src/data/SQLAccess');
const contactRouter = require("./src/routes/ContactRouter");
const projectRouter = require("./src/routes/ProjectRouter");
const log = require("./src/log/Logger");

async function initialize() {
    log.debug("Start initializing database")
    const files = fs.readdirSync('scripts');
    files.sort();
    for (let i = 0; i < files.length; i++) {
        const filePath = path.join("scripts", files[i]);
        log.debug("Initialize current file ", filePath)
        await fs.readFile(filePath, {encoding: 'utf-8'}, async (err, data) => {
            if (err) {
                throw err;
            } else {
                await sqlAccess.query(data, (error, result) => {
                    log.debug("Migrated successfully file ", filePath);
                    if(error){
                        throw error;
                    }
                });
            }
        });
    }
}
initialize();

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api/v1', contactRouter);
app.use('/api/v1', projectRouter);
module.exports = app;
