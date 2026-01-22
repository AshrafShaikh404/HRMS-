const express = require('express');
const router = express.Router();
const {
    createGoal,
    getGoals,
    getMyGoals,
    updateGoal,
    updateGoalProgress,
    deleteGoal
} = require('../controllers/goalController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

router.use(protect);

// My Goals (Specific route first to avoid collision with :id)
router.get('/my', getMyGoals);

// CRUD
router.route('/')
    .post(authorize('admin', 'hr', 'manager'), createGoal) // Employees usually don't assign goals themselves? Or self-goals? Keeping stricter for now.
    .get(getGoals);

router.route('/:id')
    .put(updateGoal) // Controller handles permission logic specifically
    .delete(deleteGoal);

router.patch('/:id/progress', updateGoalProgress);

module.exports = router;
