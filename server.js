const getData = require('./server/db_data/get');
const postData = require('./server/db_data/post');
const deleteData = require('./server/db_data/delete');
const putData = require('./server/db_data/put');

const port = process.env.PORT || 5000;
const { v4: uuidv4 } = require('uuid');
const http = require("http");
const express = require('express');

var WebSocketServer = require("websocket").server;
var app = express();
var bodyParser = require('body-parser');
var clients = [];
var currentPlayer = ""
var usernameAmount = 0

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
async function get(tableName, fieldId, clientId) {
    const data = await getData(tableName, fieldId, clientId);
    console.log(data);
    return data;
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
function post(tableName, value, value2, status) {
    postData(tableName, value, value2, status);
}

/*
Updates Data in Database
needs tableName, value1 (to be set), column1(to be set), value2(to be overridden), column2 (wich column should be overriden)
EXAMPLE: put ('battleshipUsers', 'Lea', 'userName', 'Julia', 'userName');
https://restfulapi.net/rest-put-vs-post/
//TODO: query for client name with client id
 */
function put(val1, val2){
    putData(val1, val2);
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
    deleteData(tableName);
}

wss.on('request', function (request) {
    console.log('Connection from origin ' + request.origin, request.headers);
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;

    var clientNumber = {
        number: clients.length
    };

    if (clients.length > 2) {
        wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
    } else if (clients.length === 2) {
        wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
    } else {
        wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
        //check that game starts always with empty tables
        clear('battleshipUsers');
        clear('generatedShipFields');
    }

    connection.on('message', async function (message) {
        if (message.type === 'utf8') {
            try {
                var json = JSON.parse(message.utf8Data);
                var type = json.type;


                //message from player after click on cell
                if (type === "clickedCell") {
                    console.log("INFO: Getting user specific field.", json.data.cell, json.data.id)
                    var field = (await get('generatedShipFields', json.data.cell, json.data.id)) //FIXME: table-name: string, cellId: int, clientID: string
                    //miss
                    if (field[0].status === -1) {
                        var msg = {
                            type: "missCell",
                            data: {
                                cell: json.data.cell,
                            }
                        }
                        wss.broadcastSender(JSON.stringify(msg), connection)
                        currentPlayer = currentPlayer === 0 ? 1 : 0;
                        wss.broadcastTurn(currentPlayer, false)
                    } else {
                        //ship
                        var msg = {
                            type: "shipCell",
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
                            clear('generatedShipFields'); //FIXME: tablename: string

                            setTimeout(function () { 
                                var resetMsg = {
                                    type: "reset",
                                    data: {
                                        newGame: true
                                    }
                                };
                                wss.broadcast(JSON.stringify(resetMsg));

                                clientNumber = {
                                    "number": clients.length
                                };

                                if (clients.length > 2) {
                                    wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
                                } else if (clients.length === 2) {
                                    wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
                                    currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
                                    wss.broadcastTurn(currentPlayer, true)
                                } else {
                                    wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
                                }
                            }, 10000)
                        } else {
                            //game continues
                            currentPlayer = currentPlayer === 0 ? 1 : 0;
                            wss.broadcastTurn(currentPlayer, false)
                        }
                    }
                } else if (type === "username") {
                    if (json.data.userId === null) {
                        //adding new user
                        var createdId;
                        var userWithId = null

                        while (userWithId !== undefined) {
                            createdId = uuidv4()
                            userWithId = await get("battleshipUsers", null, createdId) //FIXME: tablename: string, null (name does not matter), clientID: string
                            //returns row with created testId - duplicate check
                        }

                        var idMsg = {
                            type: "userId",
                            data: {
                                id: createdId
                            }
                        }

                        post("battleshipUsers", json.data.name, createdId);  //FIXME: tablename:string, userName: string, clientID: string
                        usernameAmount++
                        wss.broadcastSender(JSON.stringify(idMsg), connection) //sets userId in client

                        if (usernameAmount === 2) { //wanted to do this with db but it was too slow
                            currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
                            wss.broadcastTurn(currentPlayer, true)
                        }
                    } else {
                        //updating username
                        put("battleshipUsers", json.data.name, userId) //TODO: query: name-string, id-string
                    }

                    var name = {
                        username: json.data.name,
                    };

                    var json = JSON.stringify({ type: 'username', data: name });

                    var otherClient;
                    for (var i = 0; i < 2; i++) {
                        if (clients[i] !== connection) {
                            otherClient = clients[i]
                        }
                    }

                    wss.broadcastSpecific(json, otherClient) //sends name to other player



                } else if (type === "generatedCell") {
                    post("generatedShipFields", json.data.grid, json.data.id, "cells") //FIXME: grid: array including -1/1, cellId: string, type: "cells" (could be changed)
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
            type: "reset",
            data: {
                newGame: false
            }
        };

        clear('battleshipUsers') //tablename: string
        clear('generatedShipFields') //tablename: string
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
            wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection);
            currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
            wss.broadcastTurn(currentPlayer, false)
        } else {
            wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
        }

    })
});


//message to all clients
wss.broadcast = function (data) {
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

wss.broadcastTurn = function (currentPlayer, isGameStart) {
    var data= {
        gameStart: isGameStart
    }
    wss.broadcastSpecific(JSON.stringify({ "type": "yourTurn", "data": data}), clients[currentPlayer]);
    wss.broadcastSpecific(JSON.stringify({ "type": "opponentsTurn", "data": data }), clients[currentPlayer === 0 ? 1 : 0])
};

