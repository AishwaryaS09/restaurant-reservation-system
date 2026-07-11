const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/tableController');
const { createTableValidator, updateTableValidator } = require('../validators/tableValidator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getAll);
router.post('/', protect, authorize('admin'), createTableValidator, create);
router.put('/:id', protect, authorize('admin'), updateTableValidator, update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
