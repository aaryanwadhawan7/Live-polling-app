const { options } = require("../routes/pollingRoutes");

let polls = []; // list of objects
// polls [Schema] :
/*
  {
     id : pollId, // generate automatically
     title : title, // req body
     questions : [], // list of object
     students : {}, // multiple studentId's -> object
     result : {}, // result may vary bassed on student response -> object
     history : [] // list 
  }
 */

let pollIdCounter = 0;

function generatePollId() {
  const genPollId = pollingIdCounter++;
  return genPollId.toString();
}

function generateQuestionId(poll) {
  const quesId = (poll.questions.length + 1).toString();
  return quesId;
}

module.exports = {
  // teacher can create a poll
  createPoll: (req, res) => {
    try {
      const pollId = generatePollId();
      const { title } = req.body;

      if (!title) {
        res.status(400).json({
          message: "Title is required!",
        });
      }

      polls[pollId] = {
        id: pollId,
        title: title,
        questions: [],
        students: {},
        results: {},
        history: [],
      };

      res.status(201).json({
        pollId,
      });
    } catch (err) {
      res.status(400).json({
        Error: err.message,
      });
    }
  },

  // teacher can add a question
  addQuestion: (req, res) => {
    try {
      const pollId = req.params;
      const { text, options, timeLimit = 60 } = req.body;
      if (!text || !options) {
        res.status(400).json({
          message: "Title and options are required!",
        });
      }

      const poll = polls[pollId];
      if (!poll) {
        res.status(400).json({
          message: "Poll didn't exist!",
        });
      }

      if (
        !poll.questions.length ||
        !poll.questions[poll.questions.length - 1].completed
      ) {
        res.status(400).json({
          message: "Previous questions not finished",
        });

        const questionId = generateQuestionId(poll);
        const question = {
          id: questionId,
          text,
          options,
          answers: {},
          completed: false,
          resultShown: false,
        };

        poll.questions.push(question);
        res.json({
          questionId,
        });
      }
    } catch (err) {
      res.status(400).json({
        Error: err.message,
      });
    }
  },

  submitAnswers: (req, res) => {
    try {
      // pollId and questionId
      const { pollId, questionId } = req.params;
      const { studentId, answer } = req.body;
      const poll = polls[pollId];
      if (!poll) {
        res.status(400).json({
          message: "Poll didn't exist with this pollId!",
        });
      }

      const question = poll.questions.find((q) => q.id === questionId);
      if (!question) {
        // ques didn't exist
        res.json({
          message: "Teacher haven't posted a question with this pollId!",
        });
      }

      if (question.completed) {
        res.status(400).json({
          message: "Questions has ended! Cannot submit the response.",
        });
      }

      // add student ans to poll
      poll.students[studentId] = { id: studentId };
      res.status(400).json({
        message: "Answer submitted!",
      });

      const totalStudents = Object.keys(poll.students).length;
      if (Object.keys(question.answers).length === totalStudents) {
        question.completed = true;
        poll.history.push(question);
      }
    } catch (err) {
      res.status(400).json({
        Error: err.message,
      });
    }
  },

  getResults: (req, res) => {
    try {
      const { pollId } = req.params;
      const poll = polls[pollId];
      if (!poll) {
        res.status(400).json({
          message: "Poll didn't exist!",
        });
      }
      // poll exist -> empty list
      let results = [];
      if (poll.questions.length > 0) {
        // there is atleast one ques
        // access the ques
        const lastQues = poll.questions[poll.questions.length - 1];
        results = lastQues.answers;
      }

      res.json({
        results,
      });
    } catch (err) {
      Error: err.message;
    }
  },

  getHistory : (req, res) => {
    const { pollId } = req.params;
    const currPoll = polls[pollId];
    // push ques meta data to history
    const history = currPoll.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      answers: q.answers,
      completed: q.completed,
      resultShown : false,
      timeLimit: q.timeLimit
    }));

    res.json ({
      history
    })
  },
};
