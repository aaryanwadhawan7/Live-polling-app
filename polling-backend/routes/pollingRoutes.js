const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController'); // polling functional/buisness logic
// endpoints for addQuestions, submitAnswers, getResults, getHistory and createPoll

router.post('/', pollController.createPoll);
// poll -> pollId

router.post('/:pollId/questions', pollController.addQuestion);

router.post("/:pollId/questions/:questionId/answers", pollController.submitAnswers);

router.post('/:pollId/results', pollController.getResults);

router.post('/:pollId/history', pollController.getHistory);

module.exports = router;
