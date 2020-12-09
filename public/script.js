// Handle connections to a video chat room (users visiting a URL with a certain ID) by accessing the client's camera and microphone
// and adding them to the grid of videos. Also handle disconnections from the room (closing the browser tab).
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer({
  host: '/',
  port: '443'
});
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  })

  socket.on('user-connected', userId => {
    setTimeout(
      () => {
        connectToNewUser(userId, stream);
      }, 1000);
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId])
  {
    peers[userId].close();
  }
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
})

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

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}