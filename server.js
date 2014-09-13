var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var checkers = require('./checkers');

var HTTP_DEFAULT = 3000;
var CHECKERS_DEFAULT = 5000;

app.get('/', function(req, res) {
   res.sendFile('index.html', { root: './' });
});

app.get('/reset.css', function(req, res) {
   res.sendFile('reset.css', { root: './' });
});

io.on('connection', function(socket) {

   function status_handler(msg) {
      var STATUS = 'STATUS';
      var status_types = ['GAME_ID', 'BOARD', 'MOVED', 'CAPTURED', 'WINNER', 'TURN', 'KING', 'LIST SPECTATE'];
      for (var i=0; i<status_types.length; i++) {
         type = status_types[i];
         statusPrefix = STATUS + ' ' + type;
         prefixIndex = msg.indexOf(statusPrefix);
         if (prefixIndex >= 0) {
            content = msg.substring(prefixIndex + statusPrefix.length).trim();
            socket.emit(type, content);
         }
      }
   }

   game = checkers.connect(status_handler, CHECKERS_DEFAULT);

   socket.on('commands', function(data) {
      game.send(data);
   });

   socket.on('disconnect', function() {
      game.send('QUIT');
   });
});

var port = HTTP_DEFAULT;
http.listen(port, function() {
  console.log('listening on *:' + port);
});

