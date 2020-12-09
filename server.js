//CREDIT FOR ALL FILES: https://www.youtube.com/watch?v=DvlyzDZDEq4&t=102s

// Set up the server for web development with Express, Socket.io, and UUID (for generating random IDs for the URLs)
const express = require('express'); // Web development framework
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

//Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));

// Handle GET requests to the default URL: generate a new ID for a new video chat room and redirect the user to that URL/room
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

// Handle GET requests to the default URL with a slash followed by a room ID
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

// Handle connections to video chat rooms
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

const port = process.env.PORT || 8080;
server.listen(port)