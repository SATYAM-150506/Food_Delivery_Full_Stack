const HelpDesk = require('../models/HelpDesk');
const Order = require('../models/Order');
const User = require('../models/User');

// Create a help desk ticket
exports.createHelpDeskTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, message, issueType, priority = 'medium', relatedOrder } = req.body;
    
    // Validate required fields
    if (!subject || !message || !issueType) {
      return res.status(400).json({ error: 'Subject, message, and issue type are required' });
    }

    // If relatedOrder is provided, verify it belongs to the user
    if (relatedOrder) {
      const order = await Order.findById(relatedOrder);
      if (!order || order.user.toString() !== userId) {
        return res.status(404).json({ error: 'Order not found or not owned by user' });
      }
    }

    const helpDeskTicket = new HelpDesk({
      user: userId,
      subject,
      message,
      issueType,
      priority,
      relatedOrder: relatedOrder || null,
      responses: [{
        author: req.user.name || 'User',
        message,
        timestamp: new Date(),
        isAgent: false
      }]
    });

    await helpDeskTicket.save();
    
    // Populate user details for response
    await helpDeskTicket.populate('user', 'name email');
    
    res.status(201).json({ 
      message: 'Help desk ticket created successfully', 
      ticket: helpDeskTicket 
    });
  } catch (err) {
    console.error('Create help desk ticket error:', err);
    res.status(500).json({ error: 'Failed to create help desk ticket', details: err.message });
  }
};

// Get all help desk tickets for the user
exports.getUserHelpDeskTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: userId };
    if (status) {
      query.status = status;
    }
    
    const tickets = await HelpDesk.find(query)
      .populate('user', 'name email')
      .populate('relatedOrder', 'orderId status totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await HelpDesk.countDocuments(query);
    
    res.status(200).json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get user help desk tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch help desk tickets', details: err.message });
  }
};

// Get a specific help desk ticket
exports.getHelpDeskTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    
    const ticket = await HelpDesk.findOne({ _id: ticketId, user: userId })
      .populate('user', 'name email')
      .populate('relatedOrder', 'orderId status totalAmount items');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Help desk ticket not found' });
    }
    
    res.status(200).json(ticket);
  } catch (err) {
    console.error('Get help desk ticket error:', err);
    res.status(500).json({ error: 'Failed to fetch help desk ticket', details: err.message });
  }
};

// Add a response to help desk ticket
exports.addResponseToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const ticket = await HelpDesk.findOne({ _id: ticketId, user: userId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Help desk ticket not found' });
    }
    
    ticket.responses.push({
      author: req.user.name || 'User',
      message,
      timestamp: new Date(),
      isAgent: false
    });
    
    // Update status if closed
    if (ticket.status === 'closed') {
      ticket.status = 'open';
    }
    
    await ticket.save();
    
    res.status(200).json({ 
      message: 'Response added successfully', 
      ticket 
    });
  } catch (err) {
    console.error('Add response to ticket error:', err);
    res.status(500).json({ error: 'Failed to add response', details: err.message });
  }
};

// Admin: resolve help desk ticket
exports.resolveHelpDeskTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { resolutionNotes, status = 'resolved' } = req.body;
    
    const ticket = await HelpDesk.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Help desk ticket not found' });
    
    ticket.status = status;
    ticket.resolutionNotes = resolutionNotes || '';
    ticket.assignedAgent = req.user.name || 'Admin';
    
    // Add admin response
    if (resolutionNotes) {
      ticket.responses.push({
        author: req.user.name || 'Support Agent',
        message: resolutionNotes,
        timestamp: new Date(),
        isAgent: true
      });
    }
    
    await ticket.save();
    
    res.status(200).json({ message: 'Help desk ticket updated successfully', ticket });
  } catch (err) {
    console.error('Resolve help desk ticket error:', err);
    res.status(500).json({ error: 'Failed to resolve help desk ticket', details: err.message });
  }
};

// Admin: Get all help desk tickets
exports.getAllHelpDeskTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const tickets = await HelpDesk.find(query)
      .populate('user', 'name email')
      .populate('relatedOrder', 'orderId status totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await HelpDesk.countDocuments(query);
    
    res.status(200).json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get all help desk tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch help desk tickets', details: err.message });
  }
};
