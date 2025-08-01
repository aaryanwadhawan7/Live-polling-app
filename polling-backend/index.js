const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express ();

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
app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`)
})
