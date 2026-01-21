const express = require('express');
const {
    getRoles,
    createRole,
    updateRole,
    getPermissions,
    assignRoleToUser
} = require('../controllers/roleController');
const { protect } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/checkPermission');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(checkPermission('view_settings'), getRoles) // Viewing roles allowed with view_settings or a specific view_roles? using view_settings for now or manage_access_control
    .post(checkPermission('manage_access_control'), createRole);

router.route('/permissions')
    .get(checkPermission('manage_access_control'), getPermissions);

router.route('/:id')
    .put(checkPermission('manage_access_control'), updateRole);

router.route('/assign')
    .post(checkPermission('manage_access_control'), assignRoleToUser);

module.exports = router;
