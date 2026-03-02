const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { isAuthenticated } = require('../middleware/auth');

// All intranet routes require authentication
router.use(isAuthenticated);

router.get('/', noteController.getDashboard);
router.get('/new', noteController.getCreateNote);
router.post('/', noteController.postCreateNote);
router.get('/:id/edit', noteController.getEditNote);
router.put('/:id', noteController.putUpdateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
