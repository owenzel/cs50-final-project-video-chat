// Handle connections to a video chat room (users visiting a URL with a certain ID) by accessing the client's camera and microphone
// and adding them to the grid of videos. Also handle disconnections from the room (closing the browser tab).

const socket = io('/'); // Connect to our root path
const videoGrid = document.getElementById('video-grid'); // Get the video grid on the page

// Create a new peer object that connects to the PeerJS server
const myPeer = new Peer({
  host: '/',
  port: '443'
});

// Create a video for the newly joing user to add to the grid of videos and mute their audio (so they can't hear themselves)
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

// Add the user's video to the grid
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  // Listen to when someone tries to call us on the myPeer object and respond
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  })

  // When a new user joins the same room, connect to them
  socket.on('user-connected', userId => {
    setTimeout(
      () => {
        connectToNewUser(userId, stream);
      }, 1000);
  })
})

// When a user leaves the room, close their video block
socket.on('user-disconnected', userId => {
  if (peers[userId])
  {
    peers[userId].close();
  }
})

// When the user joins the room/connects, emit the event that a user has joined
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
})

// Connect to a new user that joins the room
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  })
  call.on('close', () => {
    video.remove();
  })

  peers[userId] = call;
}

// Play the video once the video and stream are loaded
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}