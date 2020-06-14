const getData = require('./server/db_data/get');
const postData = require('./server/db_data/post');
const deleteData = require('./server/db_data/delete');
const putData = require('./server/db_data/put');
var WebSocketServer = require("websocket").server;
const { v4: uuidv4 } = require('uuid');
var http = require("http");
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var bodyParser = require('body-parser');
var clients = [];
var currentPlayer = ""
var userId = null

app.use(bodyParser.json());
app.use(express.static('client'));
app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
server.listen(port);
console.log("Server listening on port: %d", port);

var wss = new WebSocketServer({ httpServer: server });
console.log("Websocket server created");


/*
Gets Data from DB
needs value = battleshipUsers | generatedShipFields 
get('battleshipUsers')
TODO: query for getting cell status with client id
TODO: client name with client id
 */
function get(tableName) {
    const data = getData(tableName);
}

/*
Inserts a new value to Database
needs tablename and value to insert
EXAMPLE: post('battleshipUsers', 'Julia');
https://restfulapi.net/rest-put-vs-post/
parameters: cellid, clientid, status -> send all fields -generated ship fields
client name
TODO: query for generated fields
TODO: query for username with client id
 */
function post(tableName, value) {
    const data = postData(tableName, value);
}

/*
Updates Data in Database
needs tableName, value1 (to be set), column1(to be set), value2(to be overridden), column2 (wich column should be overriden)
EXAMPLE: put ('battleshipUsers', 'Lea', 'userName', 'Julia', 'userName');
https://restfulapi.net/rest-put-vs-post/
//TODO: query for client name with client id
 */
function put(tableName, val1, col1, val2, col2) {
    const data = putData(tableName, val1, col1, val2, col2);
}

/*
Deletes Table content
needs tableName
EXAMPLE: clear('battleshipUsers');
on reset:
next game: clear shiptable (change in game.js)
on close: clear names & shiptable
 */
function clear(tableName) {
    const data = deleteData(tableName);
}


wss.on('request', function (request) {
    console.log('Connection from origin ' + request.origin, request.headers);
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;

    var clientNumber = {
        "number": clients.length
    };

    if (clients.length > 2) {
        wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
    } else if (clients.length === 2) {
        wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
        currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
        wss.broadcastTurn(currentPlayer)
    } else { 
        wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
    }


    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            try {
                var json = JSON.parse(message.utf8Data);
                var type = json.type;

                //message from player after click on cell
                if (type === "clickedCell") {
                    var status = get('generatedShipFields', json.data.cell, userId) //TODO: query- get status where cell=cell & userId = userId
                    //TODO: check what gets back (would net an integer)

                    //miss
                    if (status === -1) {
                        var msg = {
                            type: "shipCell",
                            data: {
                                cell: json.data.cell,
                            }
                        }
                        wss.broadcastSender(JSON.stringify(msg), connection)
                        currentPlayer = currentPlayer === 0 ? 1 : 0;
                        wss.broadcastTurn(currentPlayer)
                    } else {
                        //ship
                        var msg = {
                            type: "missCell",
                            data: {
                                cell: json.data.cell,
                            }
                        }
                        wss.broadcastSender(JSON.stringify(msg), connection)

                        //game over - player has won
                        if (json.data.foundShipCounter === 16) {
                            var lossMsg = {
                                type: "loss"
                            };
                            wss.broadcastSpecific(JSON.stringify(lossMsg), clients[currentPlayer === 0 ? 1 : 0]);
                            setTimeout(function () {
                                var resetMsg = {
                                    type: "reset"
                                };
                                delete ('generatedShipFields')
                                wss.broadcast(JSON.stringify(resetMsg));

                                clientNumber = {
                                    "number": clients.length
                                };

                                if (clients.length > 2) {
                                    wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
                                } else if (clients.length === 2) {
                                    wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
                                    currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
                                    wss.broadcastTurn(currentPlayer)
                                } else {
                                    wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
                                }
                            }, 10000)
                        } else {
                            //game continues
                            currentPlayer = currentPlayer === 0 ? 1 : 0;
                            wss.broadcastTurn(currentPlayer)
                        }
                    }
                } else if (type === "username") {
                    //username gets updated or set
                    if (userId === null) {
                        var testId;
                        var id = "undefined"

                        //TODO: check how we get data back and adapt code
                        while(id !== undefined){
                            testId = uuidv4()
                            id = get("battleshipUsers", testId) //TODO: query: select where id = userId
                        } 
                        userId = testId
                        //user to db
                        post("battleshipUsers", json.data.name, userId) //TODO: query: name-string, id-string
                    } else {
                        //updating username
                        put("battleshipUsers", json.data.name, userId) //TODO: query: name-string, id-string
                    }

                    var name = {
                        username: json.data.name,
                    };

                    var json = JSON.stringify({ type: 'username', data: name });
                    wss.broadcastRecipients(json, connection)
                } else if (type === "cellStatus") {
                    //sets cells in db
                    post("generatedShipFields", json.data.cell, userId, json.data.status) //TODO: query: cell-int, userId-string, status-int
                }
            } catch (e) {
                console.log('Error parsing JSON', e)
            }

        }

    });

    connection.on('close', function (connection) {
        clients.splice(index, 1);
        console.log('Connection closed')
        clientNumber["number"] = clients.length; //do not need tahat
        var resetMsg = {
            type: "reset"
        };

        delete ('battleshipUsers')
        delete ('generatedShipFields')
        wss.broadcast(JSON.stringify(resetMsg));

        if (index < 2) {
            var closeMsg = {
                type: 'close'
            };
            wss.broadcastSpecific(JSON.stringify(closeMsg), clients[0])
        }

        clientNumber = {
            "number": clients.length
        };

        //TODO: after DB stuff - make function for this code block (lea)
        if (clients.length > 2) {
            wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
        } else if (clients.length === 2) {
            //TODO: query: number of users (should work with current query i guess) - adapt according to how we get data
            //var numberOfNames = get('battlshipUsers').length
            //i will finish that after the query adaption (lea)
            wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
            currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
            wss.broadcastTurn(currentPlayer)
        } else {
            wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
        }

    })
});


//message to all clients
wss.broadcast = function (data) {
    console.log('clients', clients, clients.length)
    clients.forEach(function (client) {
        client.sendUTF(data)
    })
};

//message to all clients but NOT the sender
wss.broadcastRecipients = function (data, sender) {
    clients.forEach(function (client) {
        if (client !== sender) {
            client.sendUTF(data)
        }
    })
};

//message only to sender
wss.broadcastSender = function (data, sender) {
    clients.forEach(function (client) {
        if (client === sender) {
            client.sendUTF(data)
        }
    })
};

//message only to one specific
wss.broadcastSpecific = function (data, client) {
    client.sendUTF(data)
};

wss.broadcastTurn = function (currentPlayer) {
    wss.broadcastSpecific(JSON.stringify({ "type": "yourTurn" }), clients[currentPlayer]);
    wss.broadcastSpecific(JSON.stringify({ "type": "opponentsTurn" }), clients[currentPlayer === 0 ? 1 : 0])
};
