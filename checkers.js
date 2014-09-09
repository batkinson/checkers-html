var net = require('net');

function createClient(handler) {

   var result = { 

      'data': '',

      'commands': [],

      'read':  function(data) {
         result.data += data;
         lineTerminator = '\r\n';
         var i = result.data.indexOf(lineTerminator);
         while (i >= 0) {
            line = result.data.substring(0, i);
            result.data = result.data.substring(i+lineTerminator.length)
               i = result.data.indexOf(lineTerminator);
            if (line.indexOf('OK') >= 0 || line.indexOf('ERROR') >= 0) {
               if (result.commands.length > 0) {
                  handler = result.commands.pop();
                  handler(line);
               }
            } else {
               result.status(line);
            }
         }
      },

      'end': function() {
         client.end();
      },

      'client':  net.connect({port: 5000}, function() {
            result.client.on('data', result.read);
            result.client.on('end', result.end);
            }),

      'send': function(line, responseHandler) {
         if (responseHandler) {
            result.commands.push(responseHandler);
         } else {
            result.commands.push(function(response) {});
         }
         result.client.write(line + '\r\n');
      },

      'status': function(line) {},
   };

   if (handler) {
      result.status = handler;
   }

   return result;
}

exports.connect = createClient
