var WebSocketServer = require("websocket").server;
var http = require("http");
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var bodyParser = require('body-parser');
var clients = [ ];
const getData = require('./server/db_data/get');
const postData = require('./server/db_data/post');
const deleteData = require('./server/db_data/delete');
const putData = require('./server/db_data/put');

app.use(bodyParser.json());

app.use(express.static('client'));

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);


/*
Gets Data from DB
needs value = battleshipUsers | generatedShipFields | usedFields
get('battleshipUsers')
 */
function get(tableName){
    const data = getData(tableName);
}

/*
Inserts a new value to Database
needs tablename and value to insert
EXAMPLE: post('battleshipUsers', 'Julia');
https://restfulapi.net/rest-put-vs-post/
 */
function post(tableName, value){
    const data = postData(tableName, value);
}

/*
Updates Data in Database
needs tableName, value1 (to be set), column1(to be set), value2(to be overridden), column2 (wich column should be overriden)
EXAMPLE: put ('battleshipUsers', 'Lea', 'userName', 'Julia', 'userName');
https://restfulapi.net/rest-put-vs-post/
 */
function put(tableName, val1, col1, val2, col2){
    const data = putData(tableName, val1, col1, val2, col2);
}

/*
Deletes Table content
needs tableName
EXAMPLE: clear('battleshipUsers');
 */
function clear (tableName){
    const data = deleteData(tableName);
}


app.listen(port, function () {
    console.log('Server is running on port 5000');
});

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
    var clientNumber = {
        "number": clients.length
    }

    if(clients.length > 2){
        wss.broadCastSender(JSON.stringify({"type": 'clients', "data": clientNumber}), connection)
    } else {
        wss.broadcast(JSON.stringify({"type": 'clients', "data": clientNumber}), connection, true)
    }


    //TODO: different kinds of messages
    //https://stackoverflow.com/questions/7543804/websockets-how-to-create-different-messages
    connection.on('message', function(message){
        if (message.type === 'utf8') {
            var obj = {
                time: (new Date()).getTime(),
                username:message.utf8Data,
            };

            var json = JSON.stringify({type: 'username', data: obj});
            wss.broadcast(json, connection, false)
        }
    })

    connection.on('close', function(connection){
        clients.splice(index, 1);
        console.log('connection closed :(')
        clientNumber["number"] = clients.length
        wss.broadcast(JSON.stringify({type: 'clients', data: clientNumber}), connection, true)
    })
})

//https://stackoverflow.com/questions/35535700/websockets-send-messages-and-notifications-to-all-clients-except-sender
wss.broadcast = function(data, sender, clientNumber){
    console.log('broadcast', clientNumber, data)
    if(clientNumber){
        clients.forEach(function(client) {
            client.sendUTF(data)
        })
    } else {
        clients.forEach(function(client) {
            if(client !== sender){
                client.sendUTF(data)
            }
        })
    }
}

wss.broadCastSender = function(data, sender){
    clients.forEach(function(client) {
        if(client === sender){
            client.sendUTF(data)
        }
    })
}
