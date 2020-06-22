$(function () {
    "use strict";

    var username = "";
    var formControl = $('.form-control');
    var gridA = $('#table-grid-a');
    var gridB = $('#table-grid-b');
    var submitButton = $('#submitButton');
    var headingA = $('#heading-a');
    var headingB = $('#heading-b');
    var shipsA = $('#ships-a');
    var shipsB = $('#ships-b');
    var inputField = $('#name-input');
    var waitingText = $('#wait-text');
    var gridArray = new Array(100).fill(-1);
    var turnText = $('#turn-text');
    var triedCells = [];
    var foundShipCounter = 0;
    var userId = null;

    //---websocket---
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) {
        console.log('Sorry, your browser does not support websockets');
        return;
    }
    //TODO: change between heroku and local
    var host = location.origin.replace(/^http/, 'ws');
    //var host = 'ws://127.0.0.1:5000'; //- localhost:5000
    var ws = new WebSocket(host);

    ws.onopen = function () {
        console.log("Websocket opened");
        createTable(gridA, "A");
        createTable(gridB, "B");
    };

    //works in Firefox
    ws.onerror = function (error) { 
        console.log('Sorry, there is a problem with the connection.', error);
        alert("Sorry, there is a problem with the connection. Please try again later.");
    };

    ws.onclose = function () {
        console.log('Websocket closed')
    }

    ws.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);

            switch (json.type) {
                case "username":
                    onUserNameMessage(json.data.username);
                    break;
                case "clients":
                    onClientMessage(json.data.number);
                    break;
                case "yourTurn":
                    onYourTurn(json.data.gameStart, json.data.foundShips);
                    break;
                case "opponentsTurn":
                    onOpponentsTurn(json.data.gameStart);
                    break;
                case "loss":
                    onLoss(json.data.foundShips);
                    break;
                case "reset":
                    resetGame(json.data.newGame, json.data.completeStart);
                    break;
                case "close":
                    alert("Unfortunately your opponent logged of...");
                    break;
                case "shipCell":
                    onShipCell(json.data);
                    break
                case "missCell":
                    onMissCell(json.data);
                    break;
                case "userId":
                    userId = json.data.id;
                    break
                default:
                    break
            }
        } catch (e) {
            console.log('Error parsing JSON');
            return;
        }
    };

    setInterval(function () {
        if (ws.readyState !== 1) {
            console.log('Unable to communicate with the WebSocket server.')
        }
    }, 3000);

    function onLoss(foundShips) {
        turnText.text("YOU LOST! \nNext game starts in 10sec.").css('color', '#FF0000');
        shipsA.text('Number of ships your opponent has sunken: ' + foundShips)
    }

    //player clicked on a cell with a ship
    function onShipCell(data) {
        $('#' + data.cell + "B").append($('<i>').addClass('material-icons').text('directions_boat')).css('background-color', '#7FFF00').attr('disabled', 'disabled');
        foundShipCounter++;
        triedCells.push(data.cell);
        shipsB.text("Number of ships you have sunken: " + foundShipCounter);

        //check for win
        if (foundShipCounter === 16) {
            turnText.text("YOU WON! \nNext game starts in 10sec.").css('color', '#7FFF00');
            disableCells()
        }
    }

    //player clicked a cell without a ship
    function onMissCell(data) {
        $('#' + data.cell + "B").append($('<i>').addClass('material-icons').text('clear')).css('background-color', '#FF0000').attr('disabled', 'disabled');
        triedCells.push(data.cell);
    }

    function resetGame(newGame, completeStart) {
        //after win: newGame: true, completeStart: false
        //player closed: newGame: false, completeStart: true

        //the 2 player do NOT keep playing
        if (!newGame) {
            username = "";
            headingB.text("Your opponent's table");
            headingA.text('Your table');
            submitButton.text('Submit');
            formControl.attr('placeholder', 'Enter an username');
        } else {
            submitButton.text('Update');
            formControl.attr('placeholder', 'Enter a new username');
        }

        if (completeStart) {
            inputField.addClass("input-group").removeClass("input-group-hidden");
            waitingText.addClass("centered-text-hidden").removeClass("centered-text");
            turnText.addClass('centered-text').removeClass('centered-text-hidden').text('Please wait until everyone has entered their username!').css('color', '');
            userId = null
        } else {
           turnText.addClass('centered-text-hidden').removeClass('centered-text').css('color', '');
        }

        gridArray = new Array(100).fill(-1);
        triedCells = [];
        foundShipCounter = 0;

        for (var i = 0; i < 100; i++) {
            $("#" + i + "B").attr('disabled', 'disabled').removeClass('material-icons').text('').css('background-color', '');
            $("#" + i + "A").attr('disabled', 'disabled').removeClass('material-icons').text('').css('background-color', '');
        }
        gridB.addClass("disabled-look");

        shipsA.text('Number of ships your opponent has sunken: 0');
        shipsB.text('Number of ships you have sunken: 0')
    }

    function onYourTurn(gameStart, foundShips) {
        enableCells();
        turnText.addClass('centered-text').removeClass('centered-text-hidden').text("It's your turn!");
        if (foundShips !== null) { //notification if other has found a ship
            shipsA.text('Number of ships your opponent has sunken: ' + foundShips)
        }
        if (gameStart) {
            generateRandomShips()
        }
    }

    function onOpponentsTurn(gameStart) {
        disableCells();
        turnText.addClass('centered-text').removeClass('centered-text-hidden').text("It's your opponent's turn!");
        if (gameStart) {
            generateRandomShips()
        }
    }

    function onUserNameMessage(username) {
        headingB.text(username + "'s table");
    }

    function onClientMessage(userNumber) {
        if (userNumber === 2) { //start of name input
            inputField.addClass("input-group").removeClass("input-group-hidden");
            waitingText.addClass("centered-text-hidden").removeClass("centered-text");
            turnText.addClass('centered-text').removeClass('centered-text-hidden').text('Please wait until everyone has entered their username!');
        } else if (userNumber > 2) { //client cannot play and has to wait
            inputField.removeClass("input-group").addClass("input-group-hidden");
            waitingText.addClass("centerd-text").removeClass("centered-text-hidden").text("There is already a game going on. Please try again later!");
            disableCells()
        } else { //client has to wait for another player
            inputField.removeClass("input-group").addClass("input-group-hidden");
            waitingText.addClass("centered-text").removeClass("centered-text-hidden").text("Waiting for your opponent...");
        }
    }

    function disableCells() {
        for (var i = 0; i < 100; i++) {
            $("#" + i + "B").attr('disabled', 'disabled')
        }
        gridB.addClass("disabled-look")
    }

    function enableCells() {
        for (var i = 0; i < 100; i++) {
            if (triedCells.find(element => element === i + "") === undefined) { //if i don't find a cell in the array, remove the attribute
                $("#" + i + "B").removeAttr('disabled')
            }
        }
        gridB.removeClass("disabled-look")
    }


    function createTable(gridType, idType) {
        var tableBody = gridType;
        var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        var id = 0;

        for (var i = 0; i < 12; i++) {

            var row = $('<tr>');
            for (var j = 0; j < 12; j++) {
                if ((j === 0 || j === 11) && (i !== 0 && i !== 11)) {
                    var cell = $('<td>').addClass('table-cell numbering').text(alphabet[i - 1]); //outer cells with letters
                } else if ((i === 0 || i === 11) && (j !== 0 && j !== 11)) {
                    var cell = $('<td>').addClass('table-cell  numbering').text(j); //outer cells with numbers
                } else if (((i === 0 || i === 11) && (j == 0 || j == 11)) || ((j === 0 || j === 11) && (i == 0 || i == 11))) {
                    var cell = $('<td>'); //corner cells
                } else {
                    var cell = $('<td>').addClass('table-cell  field').click(function () { onCellClick($(this).attr('id')) }).attr('id', id + idType).attr('disabled', 'disabled');
                    id++;
                }
                row.append(cell);
                tableBody.append(row);
            }
        }
        gridType.append(tableBody);
    }

    //interaction with table
    function onCellClick(id) {
        if ($('#' + id).attr('disabled') === 'disabled') {
            return;
        }

        var msg = {
            type: "clickedCell",
            data: {
                cell: id.slice(0, -1),
                foundShipCounter: foundShipCounter,
                id: userId
            }
        }
        ws.send(JSON.stringify(msg))
    }

    //username input
    submitButton.on("click", function () {
        onSubmit();
    })

    //for entering the name with "enter"
    formControl.keyup(function (e) {
        if (e.which == 13 && formControl.val().length !== 0) {
            onSubmit();
        } else if (formControl.val().length > 0) {
            submitButton.prop('disabled', false);
        } else if (formControl.val().length === 0) {
            submitButton.prop('disabled', true);
        }
    });

    function onSubmit() {
        username = formControl.val();
        headingA.text(formControl.val() + "'s Table");
        var msg = {
            type: "username",
            data: {
                name: username,
                userId: userId,
            }
        };
        ws.send(JSON.stringify(msg));
        formControl.val("");
        submitButton.prop('disabled', true);

        if (username !== null) {
            submitButton.text('Update');
            formControl.attr('placeholder', 'Enter a new username');
        }
    }

    function generateRandomShips() {
        var shipLenghts = [5, 4, 3, 2];
        var numberOfShips = [1, 1, 2, 1];

        for (var i = 0; i < shipLenghts.length; i++) {
            var direction = getRandomInt(1, 2);

            for (var j = 0; j < numberOfShips[i]; j++) {
                var startCell = "";
                var endCell = "";

                if (direction === 1) { //horizontal
                    do {
                        var row = getRandomInt(1, 10);
                        var col = getRandomInt(1, 10 - shipLenghts[i] + 1);
                        startCell = parseInt("" + (row - 1) + (col - 1)); //minus 1 bc of randomgenerator
                        endCell = startCell + shipLenghts[i]
                    } while (!areCellsFree(startCell, endCell, 1));
                } else { //vertical
                    do {
                        var row = getRandomInt(1, 10 - shipLenghts[i] + 1);
                        var col = getRandomInt(1, 10);
                        startCell = parseInt("" + (row - 1) + (col - 1));
                        endCell = parseInt("" + (row - 1 + shipLenghts[i]) + (col - 1))
                    } while (!areCellsFree(startCell, endCell, 10))
                }
            }
        }
        var msg = {
            type: "generatedCell",
            data: {
                grid: gridArray,
                id: userId
            }
        }
        ws.send(JSON.stringify(msg))
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max * min)) + min;
    }

    function areCellsFree(start, end, increment) {
        var testGrid = gridArray;
        for (var i = start; i < end; i += increment) {
            if (gridArray[i] === -1) {
                testGrid[i] = 1
            } else {
                return false
            }
        }

        gridArray = testGrid;
        setShips(start, end, increment);
        return true
    }

    function setShips(start, end, increment) {
        for (var i = start; i < end; i += increment) {
            $('#' + i + "A").append($('<i>').addClass('material-icons').text('directions_boat')).attr('disabled', 'disabled');
        }
    }

});
