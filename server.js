//CREDIT FOR 90% of this: https://www.youtube.com/watch?v=DvlyzDZDEq4

// Set up the server for web development with Express, Socket.io, and UUID (for generating random IDs for the URLs)
const express = require('express'); // Web development framework
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');

//Set the view engine to EJS
app.set('view engine', 'ejs');

// Handle GET requests to the default URL: instruct the user to go to an actual video chat room
app.get('/', (req, res) => {
  res.send("Please append a '/' to the URL followed by your video chat room ID. (Check your email for the full link.)")
})

// Combine the PeerJS server with the Express server -- Credit: 
const peerServer = ExpressPeerServer(server, {
  path:'/'
})

// Middleware for video chat rooms
app.use(peerServer);
app.use(express.static('public'));

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

const port = process.env.PORT || 443;
server.listen(port, () => console.log(`Listening on port ${port}...`));