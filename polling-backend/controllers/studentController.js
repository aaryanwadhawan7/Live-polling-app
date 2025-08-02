// join, remove
/*
{  
   id : studentId (unique identifier),
   name : "aaryan"
}

poll -> students : {}
students = {
 studentId : {id : studentId, name : name}}
 */

let studentIdCounter = 0;

function studentIdIncrement() {
  return (studentIdCounter++).toString();
}

module.exports = {
  join: (req, res) => {
    try {
      // student can "join" the poll via name or studentId
      const { name, pollId } = req.body;
      if (!name && !pollId) {
        return res.status(400).json({
          message: "Invalid Input!",
        });
      }

      // access the global variable poll via pollController
      const polls = require("./pollController").polls;
      // Check if the given pollId exist
      const poll = polls[pollId];
      const studentId = studentIdIncrement();
      poll.students[studentId] = {
        id: studentId,
        name: name,
      };

      return res.json({
        studentId,
      });
    } catch (err) {
      res.status(400).json({
        Error: err.message,
      });
    }
  },

  remove: (req, res) => {
    try {
      // teacher can remove any student in poll via studentId
      const { studentId } = req.params;
      // teacher need to check whether this student is part of poll
      const pollId = req.body;
      if (!pollId) {
        return res.json(400).json({
          message: "PollId is required",
        });
      }
      const poll = require("./pollController").polls[pollId];
      if (!poll) {
        return res.status(400).json({
          message: "PollId is not valid!",
        });
      }

      if (!poll.students[studentId]) {
        return res.status(400).json({
          message: "Student doesn't exist!",
        });
      }

      delete poll.students[studentId];

      return res.json({
        message: `Student with ${studentId} remove from the poll!`,
      });
    } catch (err) {
      res.status(400).json({
        Error: err.message,
      });
    }
  },
};
