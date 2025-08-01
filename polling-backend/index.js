const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// create an http server
// we need to create an http server becoz socket.io need
// to access the underlying HTTP server instance

const app = express ();
const server = http.createServer(app);
const io = new Server(server, {cors : {origin : "*"}});

require('./sockets/pollingSockets')(io);

app.use(cors());
app.use(express.json());

const pollRoutes = require('./routes/pollingRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Use routes
app.use('/api/polls', pollRoutes);
app.use('/api/students', studentRoutes);

// Health Check
app.use('/', () => {
    console.log("Backend is running successfully!");
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`)
})
