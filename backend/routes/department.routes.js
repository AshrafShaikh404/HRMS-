const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { checkPermission } = require('../middleware/checkPermission');
const {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

router.use(protect);

router.route('/')
    .get(authorize('admin', 'hr'), getDepartments) // HR might need to see depts too
    .post(checkPermission('manage_departments'), createDepartment);

router.route('/:id')
    .put(checkPermission('manage_departments'), updateDepartment)
    .delete(checkPermission('manage_departments'), deleteDepartment);

module.exports = router;
