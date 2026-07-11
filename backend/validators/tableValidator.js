const { body } = require('express-validator');

const createTableValidator = [
  body('tableNumber')
    .notEmpty().withMessage('Table number is required')
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status')
    .optional()
    .isIn(['available', 'reserved', 'maintenance']).withMessage('Invalid status'),
];

const updateTableValidator = [
  body('tableNumber')
    .optional()
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status')
    .optional()
    .isIn(['available', 'reserved', 'maintenance']).withMessage('Invalid status'),
];

module.exports = { createTableValidator, updateTableValidator };
