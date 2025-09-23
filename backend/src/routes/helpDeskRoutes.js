const express = require('express');
const router = express.Router();
const helpDeskController = require('../controllers/helpDeskController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User routes
router.post('/create', authMiddleware, helpDeskController.createHelpDeskTicket);
router.get('/my-tickets', authMiddleware, helpDeskController.getUserHelpDeskTickets);
router.get('/ticket/:ticketId', authMiddleware, helpDeskController.getHelpDeskTicket);
router.post('/ticket/:ticketId/response', authMiddleware, helpDeskController.addResponseToTicket);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, helpDeskController.getAllHelpDeskTickets);
router.put('/admin/resolve/:ticketId', authMiddleware, adminMiddleware, helpDeskController.resolveHelpDeskTicket);

module.exports = router;
