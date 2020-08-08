const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

const peerSerer = ExpressPeerServer(server, {
  debug: true
})


app.set('view engine', 'ejs');
app.use(express.static('public'));
const port = 443



app.use('/peerjs', peerSerer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room});
});


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).broadcast.emit("user-connected", userId);

      socket.on('message', message => {
        io.to(roomId).emit('createMessage', message);
      })
    })
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})