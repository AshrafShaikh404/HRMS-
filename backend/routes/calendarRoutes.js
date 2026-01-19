const express = require('express');
const router = express.Router();
const {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/calendarController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All calendar routes are protected

router.route('/')
    .get(getEvents)
    .post(createEvent);

router.route('/:id')
    .put(updateEvent)
    .delete(deleteEvent);

module.exports = router;
