module.exports = function(app) {

  var io = require('socket.io')(app, {path: '/at-stake-socket'});

  var CommonHandler = require('./handlers/Common'),
      PlayerLogin = require('./handlers/PlayerLogin');

  io.on('connection', function (socket) {

    // Create event handlers for this socket
    var eventHandlers = {
        common: new CommonHandler(io, socket),
        login: new PlayerLogin(io, socket)
    };

    // Bind events to handlers
    for (var category in eventHandlers) {
        var handler = eventHandlers[category].handler;
        for (var event in handler) {
            socket.on(event, handler[event]);
        }
    }
    // socket.emit('pong');

    socket.send(socket.id);

  });

 logger.info('socket.io inititalized');


};