var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var checkers = require('./checkers');

app.get('/', function(req, res) {
   res.sendFile('index.html', { root: './' });
});

io.on('connection', function(socket) {

   console.log('page connected');

   game = checkers.connect(function(status_msg) {
      console.log(status_msg);
   });

   game.send('LIST SPECTATE');

   socket.on('disconnect', function() {
      console.log('page disconnected');
      client.end();
   });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

