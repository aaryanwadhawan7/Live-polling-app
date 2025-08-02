const express = require('express');
const router = express.Router();
const studentController = require ('../controllers/studentController');

router.post('/join', studentController.join);
router.delete('/:studentId', studentController.remove);

module.exports = router;