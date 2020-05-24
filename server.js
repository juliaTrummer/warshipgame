var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require('express');
var app = express();
var port = process.env.PORT || 5000
var bodyParser = require('body-parser');
app.use(bodyParser.json());


const db = require('./app/config/db.config.js');
const User = db.users;

app.use(express.static('client'));

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
