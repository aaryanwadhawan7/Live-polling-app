let polls = {};
module.exports.polls = polls;
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

let pollingIdCounter = 0;

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
        return res.status(400).json({
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

      return res.status(201).json({
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
      const { pollId } = req.params;
      const { text, options, timeLimit = 60 } = req.body;
      if (!text || !options) {
        return res.status(400).json({
          message: "Title and options are required!",
        });
      }

      const poll = polls[pollId];
      if (!poll) {
        return res.status(400).json({
          message: "Poll didn't exist!",
        });
      }

      if (
        poll.questions.length > 0 &&
        !poll.questions[poll.questions.length - 1].completed
      ) {
        return res
          .status(400)
          .json({ message: "Previous questions not finished" });
      }

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
      return res.json({
        questionId,
      });
    } catch (err) {
      res.status(400).json({
        Error: err.message,
      });
    }
  },

  submitAnswers: (req, res) => {
    try {
      const { pollId, questionId } = req.params;
      const { studentId, answer, name } = req.body;

      const poll = polls[pollId];
      if (!poll) {
        return res.status(400).json({
          message: "Poll didn't exist with this pollId!",
        });
      }

      const question = poll.questions.find((q) => q.id === questionId);
      if (!question) {
        return res.status(400).json({
          message: "Teacher hasn't posted a question with this pollId!",
        });
      }

      if (question.completed) {
        return res.status(400).json({
          message: "Question has ended! Cannot submit the response.",
        });
      }

      question.answers[studentId] = answer;

      poll.students[studentId] = {
        id: studentId,
        name: name,
      };

      // Check if all students answered
      const totalStudents = Object.keys(poll.students).length;
      if (Object.keys(question.answers).length === totalStudents) {
        question.completed = true;
        poll.history.push(question);
      }

      return res.status(200).json({
        message: "Answer submitted!",
      });
    } catch (err) {
      return res.status(400).json({
        Error: err.message,
      });
    }
  },

  getResults: (req, res) => {
    try {
      const { pollId } = req.params;
      const poll = polls[pollId];
      if (!poll) {
        return res.status(400).json({
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

      return res.json({
        results,
      });
    } catch (err) {
      Error: err.message;
    }
  },

  getHistory: (req, res) => {
    try {
      const { pollId } = req.params;
      const currPoll = polls[pollId];
      if (!currPoll) {
        return res.status(400).json({ message: "Poll not found!" });
      }

      const history = currPoll.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        answers: q.answers,
        completed: q.completed,
        resultShown: false,
        timeLimit: q.timeLimit,
      }));

      return res.json({ history });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
