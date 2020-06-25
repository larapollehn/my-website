const express = require('express');
const projectService = require('./../services/ProjectServices');

const projectRouter = express.Router();

projectRouter.get('/projects', projectService.getProjects);

module.exports = projectRouter;