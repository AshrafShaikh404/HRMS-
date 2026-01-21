const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { checkPermission } = require('../middleware/checkPermission');
const {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation
} = require('../controllers/locationController');

router.use(protect);

router.route('/')
    .get(authorize('admin', 'hr'), getLocations)
    .post(checkPermission('manage_locations'), createLocation);

router.route('/:id')
    .put(checkPermission('manage_locations'), updateLocation)
    .delete(checkPermission('manage_locations'), deleteLocation);

module.exports = router;
