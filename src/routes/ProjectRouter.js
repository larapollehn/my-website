const express = require('express');
const {getProjectsFromRedis, getProjectFromGitHub} = require("../services/ProjectServices");

const projectRouter = express.Router();

projectRouter.get('/projects', getProjectsFromRedis, getProjectFromGitHub);

module.exports = projectRouter;
