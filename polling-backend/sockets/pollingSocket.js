let pollStore = {};

module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("student-join", ({ pollId, name }) => {
      socket.join(pollId);
      if (!pollStore[pollId]) {
        pollStore[pollId] = {
          students: {},
          questions: [],
          active: null,
          timers: {},
        };
      }

      pollStore[pollId].students[socket.id] = {
        name,
        answered: false,
      };
    });

    socket.on("create-poll", ({ pollId }) => {
      socket.join(pollId);

      pollStore[pollId] = {
        students: {},
        questions: [],
        active: null,
        timers: {},
      };
    });

    /*
        question -> Schema
        {
          id: questionId,
          text,
          options,
          answers: {},
          completed: false,
          resultShown: false,
        }

         */
    socket.on("teacher-ask-question", ({ question, pollId }) => {
      const store = pollStore[pollId];
      if (!store) {
        res.status(400).json({
          message: "PollId is not correct!",
        });
      }
      store.active = { ...question, answers: {}, complete: false };
      store.questions.push(store.active);

      // Broadcast the question to all the students
      io.to(pollId).emit("new-question", {
        text: question.text,
        options: question.options,
        timeLimit: question.timeLimit || 60,
      });

      Object.values(store.students).forEach((s) => {
        s.answered = false;
      });

      if (store.timers[pollId]) {
        clearTimeout(store.timers[pollId]);
      }
      store.timers[pollId] = setTimeout(() => {
        store.active.completed = true;
        io.to(pollId).emit("show-results", store.active.answers);
      }, (question.timeLimit || 60) * 1000);
    });

    socket.on("teacher-get-history", ({ pollId }) => {
      const store = pollStore[pollId];
      if (!store) {
        res.status(400).json({
          message: "Pollid is not valid!",
        });
        return;
      }

      io.to(socket.id).emit(
        "poll-history",
        store.questions.map((q) => ({
          text: q.text,
          options: q.options,
          answers: q.answers,
        }))
      );
    });

    socket.on("disconnect", () => {
      for (const pollId in pollStore) {
        if (pollStore[pollId].students[socket.id]) {
          delete pollStore[pollId].students[socket.id];
        }
      }
    });
  });
};
