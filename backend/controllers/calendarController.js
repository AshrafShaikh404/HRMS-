const CalendarEvent = require('../models/CalendarEvent');
const User = require('../models/User');

// @desc    Get all calendar events (filtered)
// @route   GET /api/calendar
// @access  Private
exports.getEvents = async (req, res) => {
    try {
        const { start, end, type } = req.query;
        const userId = req.user._id;
        const userRole = req.user.role;

        let query = {
            $or: [
                // 1. Events created by the user (Personal)
                { creator: userId },
                // 2. Events where user is a participant
                { participants: userId },
                // 3. Company-wide events (Visible to all)
                { visibility: 'COMPANY' }
            ]
        };

        // If user has a department, include Team events for that department
        // Note: This assumes User model has 'department' field populated or available
        if (req.user.department) {
            query.$or.push({
                visibility: 'TEAM',
                department: req.user.department
            });
        }

        // Date Range Filter
        if (start && end) {
            query.start = { $gte: new Date(start) };
            query.end = { $lte: new Date(end) };
        }

        // Event Type Filter
        if (type) {
            query.eventType = type;
        }

        const events = await CalendarEvent.find(query)
            .populate('creator', 'name email avatar')
            .populate('participants', 'name email avatar')
            .sort({ start: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new event
// @route   POST /api/calendar
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            eventType,
            start,
            end,
            allDay,
            recurrence,
            participants,
            visibility,
            department
        } = req.body;

        // Validation: Only Admin/HR can create COMPANY events
        if (visibility === 'COMPANY' && !['admin', 'hr'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to create Company events' });
        }

        const event = await CalendarEvent.create({
            title,
            description,
            eventType,
            start,
            end,
            allDay,
            recurrence,
            participants: participants || [],
            visibility,
            department: visibility === 'TEAM' ? department : null,
            creator: req.user._id,
            source: 'HRMS'
        });

        const populatedEvent = await CalendarEvent.findById(event._id)
            .populate('creator', 'name avatar')
            .populate('participants', 'name avatar');

        res.status(201).json({
            success: true,
            data: populatedEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update event
// @route   PUT /api/calendar/:id
// @access  Private
exports.updateEvent = async (req, res) => {
    try {
        let event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership or Admin privileges
        if (event.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
        }

        event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('creator', 'name avatar').populate('participants', 'name avatar');

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete event
// @route   DELETE /api/calendar/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership or Admin privileges
        if (event.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
