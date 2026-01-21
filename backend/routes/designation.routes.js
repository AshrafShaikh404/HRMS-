const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware'); // Corrected import
const { checkPermission } = require('../middleware/checkPermission');
const {
    getDesignations,
    createDesignation,
    updateDesignation,
    deleteDesignation
} = require('../controllers/designationController');

router.use(protect);

router.route('/')
    .get(authorize('admin', 'hr'), getDesignations)
    .post(checkPermission('manage_designations'), createDesignation);

router.route('/:id')
    .put(checkPermission('manage_designations'), updateDesignation)
    .delete(checkPermission('manage_designations'), deleteDesignation);

module.exports = router;
