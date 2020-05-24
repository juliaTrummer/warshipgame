var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var bodyParser = require('body-parser');
app.use(bodyParser.json());


const db = require('./app/config/db.config.js');
const User = db.users;

app.use(express.static('client'));

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
server.listen(port);

console.log("http server listening on %d", port);

var wss = new WebSocketServer({server: server});
console.log("websocket server created");

wss.on("connection", function(ws) {
    var id = setInterval(function() {
        ws.send(JSON.stringify("Hello!"))
    }, 1000);
    console.log("websocket connection open");

    ws.on("close", function() {
        console.log("websocket connection close");
        clearInterval(id)
    })
})





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
