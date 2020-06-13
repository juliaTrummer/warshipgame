var WebSocketServer = require("websocket").server;
var http = require("http");
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var bodyParser = require('body-parser');
var clients = [];
var currentPlayer = ""

app.use(bodyParser.json());
app.use(express.static('client'));
app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
server.listen(port);
console.log("Server listening on port: %d", port);

var wss = new WebSocketServer({ httpServer: server });
console.log("Websocket server created");

wss.on("connection", function (ws) {
    console.log("Websocket connection open");

    ws.on("close", function () {
        console.log("websocket connection close");
    })
})

wss.on("message", function (message) {
    console.log('message', message.utf8Data)
})

wss.on('request', function (request) {
    console.log('Connection from origin ' + request.origin)
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;

    var clientNumber = {
        "number": clients.length
    }

    if (clients.length > 2) {
        wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
    } else if (clients.length === 2) {
        wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
        currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
        wss.broadcastTurn(currentPlayer)
    } else {
        wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
    }


    //TODO: different kinds of messages
    //https://stackoverflow.com/questions/7543804/websockets-how-to-create-different-messages
    connection.on('message', function (message) {
        if (message.type === 'utf8') {

            try {
                var json = JSON.parse(message.utf8Data);
                var type = json.type;

                if (type === "clickedCell") {
                    //TODO: db
                    // FIXME. ____________________code for testing purposes_____________________________
                    var checkCellMsg = {
                        type: "checkCell",
                        data: {
                            cell: json.data.cell,
                            foundShipCounter: json.data.foundShipCounter
                        }
                    }
                    wss.broadcastSpecific(JSON.stringify(checkCellMsg), clients[currentPlayer === 0 ? 1 : 0])
                } else if (type === "checkCellResult") {
                    var checkCellResultMsg = {
                        type: "checkCellResult",
                        data: {
                            cell: json.data.cell,
                            isShip: json.data.isShip
                        }
                    }
                    wss.broadcastSpecific(JSON.stringify(checkCellResultMsg), clients[currentPlayer])
                    //one player lost and game is over
                    if (json.data.isShip && json.data.foundShipCounter === 16) {
                        var lossMsg = {
                            type: "loss"
                        }
                        wss.broadcastSpecific(JSON.stringify(lossMsg), clients[currentPlayer === 0 ? 1 : 0])
                        setTimeout(function () {
                            var resetMsg = {
                                type: "reset"
                            }
                            wss.broadcast(JSON.stringify(resetMsg))

                            clientNumber = {
                                "number": clients.length
                            }

                            if (clients.length > 2) {
                                wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
                            } else if (clients.length === 2) {
                                wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
                                currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
                                wss.broadcastTurn(currentPlayer)
                            } else {
                                wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
                            }
                        }, 10000)
                    } else {
                        currentPlayer = currentPlayer === 0 ? 1 : 0;
                        wss.broadcastTurn(currentPlayer)
                    }
                    //______________________________________________________________________
                } else if (type === "username") {
                    //TODO: db
                    var name = {
                        username: json.data.name,
                    };

                    var json = JSON.stringify({ type: 'username', data: name });
                    wss.broadcastRecipients(json, connection)
                }
            } catch (e) {
                console.log('Error parsing JSON', e)
            }

        }

    })

    connection.on('close', function (connection) {
        clients.splice(index, 1);
        console.log('connection closed :(')
        clientNumber["number"] = clients.length
        var resetMsg = {
            type: "reset"
        }

        wss.broadcast(JSON.stringify(resetMsg))

        if (index < 2) {
            var closeMsg = {
                type: 'close'
            }
            wss.broadcastSpecific(JSON.stringify(closeMsg), clients[0])
        }

        clientNumber = {
            "number": clients.length
        }

        if (clients.length > 2) {
            wss.broadcastSender(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
        } else if (clients.length === 2) {
            wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
            currentPlayer = (Math.floor(Math.random() * (2 * 1)) + 1) - 1;
            wss.broadcastTurn(currentPlayer)
        } else {
            wss.broadcast(JSON.stringify({ "type": 'clients', "data": clientNumber }), connection)
        }

    })
})

//https://stackoverflow.com/questions/35535700/websockets-send-messages-and-notifications-to-all-clients-except-sender
//message to all clients
wss.broadcast = function (data) {
    clients.forEach(function (client) {
        client.sendUTF(data)
    })
}

//message to all clients but NOT the sender
wss.broadcastRecipients = function (data, sender) {
    clients.forEach(function (client) {
        if (client !== sender) {
            client.sendUTF(data)
        }
    })
}

//message only to sender
wss.broadcastSender = function (data, sender) {
    clients.forEach(function (client) {
        if (client === sender) {
            client.sendUTF(data)
        }
    })
}

//message only to one specific
wss.broadcastSpecific = function (data, client) {
    client.sendUTF(data)
}

wss.broadcastTurn = function (currentPlayer) {
    wss.broadcastSpecific(JSON.stringify({ "type": "yourTurn" }), clients[currentPlayer])
    wss.broadcastSpecific(JSON.stringify({ "type": "opponentsTurn" }), clients[currentPlayer === 0 ? 1 : 0])
}
