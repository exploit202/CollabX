const express = require('express');
const { verifyJWT, authorizeRoles } = require('../../middleware/auth.middleware');
const { submitReport } = require('./report.controller');

const createRoleRouter = (role) => {
  const router = express.Router();
  router.use(verifyJWT, authorizeRoles(role));
  router.post('/', submitReport(role));
  return router;
};

module.exports = { createRoleRouter };
