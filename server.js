var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var checkers = require('./checkers');

var HTTP_DEFAULT = 3000;
var CHECKERS_DEFAULT = 5000;

var httpPort = HTTP_DEFAULT;
var checkersPort = CHECKERS_DEFAULT;

if (process.argv.length > 2) {
   if (process.argv.length != 4) {
      console.log('Usage: nodejs server <http-port> <checkers-port>');
      process.exit(1);
   }
   httpPort = process.argv[2];
   checkersPort = process.argv[3];
}

app.get('/', function(req, res) {
   res.sendFile('index.html', { root: './' });
});

app.get('/spectate', function(req, res) {
   res.sendFile('spectate.html', { root: './' });
});

app.use(express.static(__dirname + '/static'));

io.on('connection', function(socket) {

   function status_handler(msg) {
      var STATUS = 'STATUS';
      var status_types = ['GAME_ID', 'BOARD', 'MOVED', 'CAPTURED', 'WINNER', 'TURN', 'KING', 'LIST SPECTATE', 'LIST', 'YOU_ARE'];
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

   var game = checkers.connect(status_handler, checkersPort);

   socket.on('commands', function(data) {
      game.send(data);
   });

   socket.on('disconnect', function() {
      game.send('QUIT');
   });
});


http.listen(httpPort, function() {
  console.log('http port ' + httpPort + ' -> checkers port ' + checkersPort);
});

