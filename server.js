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
var indices = []

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
function put(val1, val2) {
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
    console.log('Connection from origin ' + request.origin);
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;
    indices.push(index)

    wss.handleNumberOfClients(connection, true, false, false) //isOnRequest: true, newGame&gameShouldContinue: false

    connection.on('message', async function (message) {
        if (message.type === 'utf8') {
            try {
                var json = JSON.parse(message.utf8Data);

                switch (json.type) {
                    //message from player after click on cell
                    case "clickedCell":
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
                            wss.broadcastSender(JSON.stringify(msg), connection) //notifies player: miss
                            currentPlayer = currentPlayer === 0 ? 1 : 0;
                            wss.broadcastTurn(currentPlayer, false) //notifies players for next turn
                        } else {
                            //ship
                            isShip = true

                            var msg = {
                                type: "shipCell",
                                data: {
                                    cell: json.data.cell,
                                }
                            }
                            wss.broadcastSender(JSON.stringify(msg), connection) //notifies player: success

                            //game over - current player has won
                            if (json.data.foundShipCounter === 16) { //FIXME: 16
                                var lossMsg = {
                                    type: "loss",
                                    data: {
                                        foundShips: json.data.foundShipCounter + 1
                                    }
                                };
                                wss.broadcastSpecific(JSON.stringify(lossMsg), clients[currentPlayer === 0 ? 1 : 0]); //notfies opponent: game lost
                                clear('generatedShipFields'); //FIXME: tablename: string

                                setTimeout(function () { //new game starts in 10sec
                                    var resetMsg = {
                                        type: "reset",
                                        data: {
                                            newGame: true,
                                            completeStart: false
                                        }
                                    };
                                    wss.broadcastSpecific(JSON.stringify(resetMsg), clients[0]); //notfies players that frontend has to be reset
                                    wss.broadcastSpecific(JSON.stringify(resetMsg), clients[1]);

                                    wss.handleNumberOfClients(connection, false, true, false, true) //isOnRequest: false, newGame: true, gameShouldContinue: false, isGameGoingOn: true
                                }, 10000)
                            } else {
                                //game continues
                                currentPlayer = currentPlayer === 0 ? 1 : 0;
                                wss.broadcastTurn(currentPlayer, false, json.data.foundShipCounter + 1)
                            }
                        }
                        break
                    case "username":
                        if (json.data.userId === null) { //adding new user
                            var createdId;
                            var userWithId = null

                            while (userWithId !== undefined) {
                                createdId = uuidv4()
                                userWithId = await get("battleshipUsers", null, createdId); //FIXME: tablename: string, null (name does not matter), clientID: string
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

                            if (usernameAmount === 2) { //checks if both players have entered their username
                                currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
                                wss.broadcastTurn(currentPlayer, true) //true: isGameStart
                            }
                        } else {
                            //updating username
                            put(json.data.name, json.data.userId) //FIXME: query: name-string, id-string
                        }

                        var name = {
                            type: "username",
                            data: {
                                username: json.data.name
                            }
                        };
                        var json = JSON.stringify(name);
                        var otherClient = connection === clients[0] ? clients[1] : clients[0]

                        wss.broadcastSpecific(json, otherClient) //sends new/updated name to other player
                        break
                    case "generatedCell":
                        post("generatedShipFields", json.data.grid, json.data.id, "cells") //FIXME: grid: array including -1/1, cellId: string, type: "cells" (could be changed)
                        //adds grid to database
                        break
                    default:
                        break

                }
            } catch (e) {
                console.log('Error parsing JSON', e)
            }

        }

    });



    connection.on('close', function (connection) {
        console.log('Connection closed')

        var newIndex = indices.indexOf(index)
        indices = indices.filter(function (value, ind, arr) { return value !== index; }) //deletes index of closing client
        clients.splice(newIndex, 1);
        usernameAmount = 0

        if (newIndex === 1 || newIndex === 0) { //notfies other player in the game 
            var closeMsg = {
                type: 'close'
            };

            wss.broadcastSpecific(JSON.stringify(closeMsg), clients[0]) //alert - to staying player

            var resetMsg = {
                type: "reset",
                data: {
                    newGame: false,
                    completeStart: true
                }
            };

            clear('battleshipUsers') //tablename: string
            clear('generatedShipFields') //tablename: string

            wss.broadcastSpecific(JSON.stringify(resetMsg), clients[0])

            if (clients.length === 1) {
                wss.handleNumberOfClients(clients[0], false, false, true)
            } else {
                wss.broadcastSpecific(JSON.stringify(resetMsg), clients[1])
            }
        }
    })
});

/**
 * on request: connection, true, false, false
 * on win/loss: connection, false, true, false, true
 * on close: connection, false, false, true
 */
wss.handleNumberOfClients = function (connection, isOnRequest, newGame, gameShouldContinue, isGameGoingOn = false) { //gameShouldContinue: true on close, isGAmeGoingOn: win
    var clientNumber = {
        type: "clients",
        data: {
            number: clients.length
        }
    }

    if (clients.length > 2) {
        //new client has to wait
        if (isGameGoingOn) {
            currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
            wss.broadcastTurn(currentPlayer, newGame)
        } else {
            wss.broadcastSender(JSON.stringify(clientNumber), connection);
        }

    } else if (clients.length === 2) {
        //game can start with submitting names
        if (!gameShouldContinue) {
            if (!isOnRequest) {
                currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
                wss.broadcastTurn(currentPlayer, newGame)
            } else {
                wss.broadcast(JSON.stringify(clientNumber), connection);
            }
        }
    } else {
        wss.broadcast(JSON.stringify(clientNumber), connection);
        if (isOnRequest) { //client joins
            //games should always start with an empty table
            clear('battleshipUsers');
            clear('generatedShipFields');
        }
    }
}


//message to all clients
wss.broadcast = function (data) {
    clients.forEach(function (client) {
        client.sendUTF(data)
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

//message for taking turns during a game
wss.broadcastTurn = function (currentPlayer, isGameStart, foundShips = null) {
    var data = {
        gameStart: isGameStart,
        foundShips: foundShips
    }
    wss.broadcastSpecific(JSON.stringify({ "type": "yourTurn", "data": data }), clients[currentPlayer]);
    wss.broadcastSpecific(JSON.stringify({ "type": "opponentsTurn", "data": data }), clients[currentPlayer === 0 ? 1 : 0])
};

