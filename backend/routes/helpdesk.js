const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/auth.middleware');
const Employee = require('../models/Employee');

// Get all tickets (with filters)
router.get('/', protect, async (req, res) => {
    try {
        const { status, category, priority, assignedTo } = req.query;
        const filter = {};

        // If employee role, only show their tickets
        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            filter.employeeId = employee._id;
        }

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (assignedTo) filter.assignedTo = assignedTo;

        const tickets = await Ticket.find(filter)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('assignedTo', 'name')
            .populate('updates.updatedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single ticket by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('employeeId', 'firstName lastName employeeCode email phone')
            .populate('assignedTo', 'name email')
            .populate('updates.updatedBy', 'name');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Check if employee can access this ticket
        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (ticket.employeeId._id.toString() !== employee._id.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new ticket
router.post('/', protect, async (req, res) => {
    try {
        const { category, subcategory, subject, description, priority, attachments } = req.body;

        // Get employee for current user
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const ticket = new Ticket({
            employeeId: employee._id,
            category,
            subcategory,
            subject,
            description,
            priority: priority || 'Medium',
            attachments: attachments || []
        });

        await ticket.save();

        const populatedTicket = await Ticket.findById(ticket._id)
            .populate('employeeId', 'firstName lastName employeeCode');

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: populatedTicket
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Assign ticket (admin/HR only)
router.put('/:id/assign', protect, async (req, res) => {
    try {
        if (req.user.role === 'employee') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { assignedTo } = req.body;

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            {
                assignedTo,
                status: 'In Progress'
            },
            { new: true }
        ).populate('assignedTo', 'name');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Ticket assigned successfully',
            data: ticket
        });
    } catch (error) {
        console.error('Error assigning ticket:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add update/comment to ticket
router.post('/:id/update', protect, async (req, res) => {
    try {
        const { comment } = req.body;

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.updates.push({
            updatedBy: req.user._id,
            comment,
            timestamp: new Date()
        });

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('updates.updatedBy', 'name');

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: updatedTicket
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Resolve ticket
router.put('/:id/resolve', protect, async (req, res) => {
    try {
        if (req.user.role === 'employee') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Resolved',
                resolvedAt: new Date()
            },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Ticket resolved successfully',
            data: ticket
        });
    } catch (error) {
        console.error('Error resolving ticket:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Close ticket
router.put('/:id/close', protect, async (req, res) => {
    try {
        if (req.user.role === 'employee') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Closed',
                closedAt: new Date()
            },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Ticket closed successfully',
            data: ticket
        });
    } catch (error) {
        console.error('Error closing ticket:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update ticket priority (admin/HR only)
router.put('/:id/priority', protect, async (req, res) => {
    try {
        if (req.user.role === 'employee') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { priority } = req.body;

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { priority },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Priority updated successfully',
            data: ticket
        });
    } catch (error) {
        console.error('Error updating priority:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
