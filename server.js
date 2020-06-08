var WebSocketServer = require("websocket").server;
var http = require("http");
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var bodyParser = require('body-parser');
var clients = [ ];

app.use(bodyParser.json());

const db = require('./app/config/db.config.js');
const User = db.users;

app.use(express.static('client'));

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
server.listen(port);

console.log("Server listening on port: %d", port);

var wss = new WebSocketServer({httpServer: server});
console.log("Websocket server created");

wss.on("connection", function(ws) {
    console.log("Websocket connection open");

    ws.on("close", function() {
        console.log("websocket connection close");
    })
})

wss.on("message", function(message){
    console.log('message', message.utf8Data)
})

wss.on('request',function(request){
    console.log('Connection from origin '+request.origin)

    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;

    connection.on('message', function(message){
        console.log('message ', message)
        if (message.type === 'utf8') { 
            var obj = {
              time: (new Date()).getTime(),
              username:message.utf8Data,
              numberOfClients: clients.length
            };
    
            var json = JSON.stringify({type: 'message', data: obj});
            wss.broadcast(json, connection)
          }
    })

    connection.on('close', function(connection){
        clients.splice(index, 1);
    })
})

//https://stackoverflow.com/questions/35535700/websockets-send-messages-and-notifications-to-all-clients-except-sender
wss.broadcast = function(data, sender){
    console.log('clients', sender)
    clients.forEach(function(client) {
        if(client !== sender){
            client.sendUTF(data)
        }
    })
}







/*
// force: true will drop the table if it already exists
db.sequelize.sync({force: true}).then(() => {
    console.log('Drop and Resync with { force: true }');
    initial();
});
require('./app/route/user.route.js')(app);

// Create a Server
var server = app.listen(process.env.PORT || 5000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("App listening at http://%s:%s", host, port)
})

function initial() {
    User.create({
        username: "NONAME"
    });

    User.create({
        username: "JULIA"
    });
}
*/
