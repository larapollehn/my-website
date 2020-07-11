const express = require('express');
import {getProjectsFromRedis, getProjectFromGitHub} from "../services/ProjectServices";

const projectRouter = express.Router();

projectRouter.get('/projects', getProjectsFromRedis, getProjectFromGitHub);

export default projectRouter;
