$(function () {
    "use strict";

    var username = "";
    var formControl = $('.form-control');
    var gridA = $('#table-grid-a');
    var gridB = $('#table-grid-b');
    var submitButton = $('#submitButton');
    var headingA = $('#heading-a');
    var headingB = $('#heading-b');
    var inputField = $('#name-input')
    var waitingText = $('#wait-text')
    var gridArray = new Array(100).fill(-1);
    var opponentName = ""
    var turnText = $('#turn-text');
    var triedCells = []
    var foundShipCounter = 0

    //---websocket---
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) {
        console.log('Sorry, your browser does not support websockets')
        return;
    }
    //TODO: heroku host
    var host = location.origin.replace(/^http/, 'ws')
    //var host = 'ws://127.0.0.1:5000' //- localhost:5000
    var ws = new WebSocket(host);

    ws.onopen = function () {
        console.log("Websocket opened")
    }

    ws.onerror = function (error) {
        console.log('Sorry, there is a problem with the connection.')
    }


    ws.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);

            switch (json.type) {
                case "username":
                    onUserNameMessage(json.data.username)
                    break
                case "clients":
                    onClientMessage(json.data.number)
                    break
                case "yourTurn":
                    onYourTurn()
                    break
                case "opponentsTurn":
                    onOpponentsTurn()
                    break
                //FIXME:____________test code________________
                case "checkCell":
                    console.log('check cell')
                    onCheckCell(json.data)
                    break
                case "checkCellResult":
                    console.log('check cell result', json.data)
                    onCheckCellResult(json.data)
                    break
                //__________________________________
                case "loss":
                    turnText.text("You have lost! Next game starts in 10sec.")
                    break
                case "reset":
                    resetGame()
                    break
                case "close":
                    alert("Unfortunately your opponent logged of...")
                    break
                default:
                    break
            }
        } catch (e) {
            console.log('Error parsing JSON: ', e);
            return;
        }
    };

    setInterval(function () {
        if (ws.readyState !== 1) {
            console.log('Unable to communicate with the WebSocket server.')
        }
    }, 3000);

    function resetGame() {
        username = ""
        gridArray = new Array(100).fill(-1);
        opponentName = ""
        triedCells = []
        foundShipCounter = 0

        for (var i = 0; i < 100; i++) {
            $("#" + i + "B").attr('disabled', 'disabled').removeClass('material-icons').text('').css('background-color', '')
            $("#" + i + "A").attr('disabled', 'disabled').removeClass('material-icons').text('').css('background-color', '')
        }
        //turnText.addClass('centered-text-hidden')
        gridB.addClass("disabled-look")
        headingB.text("Your opponent's table")
        headingA.text('Your table')
        turnText.addClass('centered-text-hidden').removeClass('centered-text')
        generateRandomShips()
    }


    //FIXME: test code
    function onCheckCell(data) {
        var result = gridArray[data.cell.slice(0, -1)] === 1 ? true : false;
        var msg = {
            type: "checkCellResult",
            data: {
                cell: data.cell,
                isShip: result,
                foundShipCounter: data.foundShipCounter
            }
        }

        ws.send(JSON.stringify(msg))
    }

    //FIXME: test code
    function onCheckCellResult(data) {
        if (data.isShip) {
            $('#' + data.cell).append($('<i>').addClass('material-icons').text('directions_boat'));
            $('#' + data.cell).css('background-color', '#7FFF00')
            foundShipCounter++
        } else {
            $('#' + data.cell).append($('<i>').addClass('material-icons').text('clear'));
            $('#' + data.cell).css('background-color', '#FF0000')
        }
        $('#' + data.cell).attr('disabled', 'disabled');

        triedCells.push(data.cell)

        if (foundShipCounter === 17) {
            turnText.text("You have won! Next game starts in 10sec.")
            disableCells()
        }

    }

    function onYourTurn() {
        enableCells()
        turnText.addClass('centered-text').removeClass('centered-text-hidden')
        turnText.text("It's your turn!")
    }

    function onOpponentsTurn() {
        disableCells()
        turnText.addClass('centered-text').removeClass('centered-text-hidden')
        turnText.text("It's your opponent's turn!")
    }

    function onUserNameMessage(username) {
        headingB.text(username + "'s table")
        opponentName = username
        console.log('Hello %s!', username)
    }

    function onClientMessage(userNumber) {
        if (userNumber === 2) {
            inputField.addClass("input-group").removeClass("input-group-hidden")
            waitingText.addClass("centered-text-hidden").removeClass("centered-text")
            enableCells()
            //TODO: make clickable after usernames! 
        } else if (userNumber > 2) {
            inputField.removeClass("input-group").addClass("input-group-hidden")
            waitingText.addClass("centerd-text").removeClass("centered-text-hidden").text("There is already a game going on. Please try again later!");
            disableCells()
        } else {
            inputField.removeClass("input-group").addClass("input-group-hidden")
            waitingText.addClass("centered-text").removeClass("centered-text-hidden")
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
            if (triedCells.find(element => element === i + "B") === undefined) {
                $("#" + i + "B").removeAttr('disabled')
            }
        }
        gridB.removeClass("disabled-look")
    }

    //table
    $(document).ready(function () {
        createTable(gridA, "A");
        createTable(gridB, "B");
        generateRandomShips();
    });

    function createTable(gridType, idType) {
        var tableBody = gridType;
        var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        var id = 0;

        for (var i = 0; i < 12; i++) {

            var row = $('<tr>');
            for (var j = 0; j < 12; j++) {
                if ((j === 0 || j === 11) && (i !== 0 && i !== 11)) {
                    var cell = $('<td>').addClass('table-cell numbering').text(alphabet[i - 1]);
                } else if ((i === 0 || i === 11) && (j !== 0 && j !== 11)) {
                    var cell = $('<td>').addClass('table-cell  numbering').text(j);
                } else if (((i === 0 || i === 11) && (j == 0 || j == 11)) || ((j === 0 || j === 11) && (i == 0 || i == 11))) {
                    var cell = $('<td>');
                } else {
                    if (idType === "A") {
                        var cell = $('<td>').addClass('table-cell  field').click(function () { onCellClick($(this).attr('id')) }).attr('id', id + idType).attr('disabled', 'disabled');
                    } else {
                        var cell = $('<td>').addClass('table-cell  field').click(function () { onCellClick($(this).attr('id')) }).attr('id', id + idType).attr('disabled', 'disabled');
                    }
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

        console.log('clicked on cell: ' + id);
        var msg = {
            type: "clickedCell",
            data: {
                cell: id,
                foundShipCounter: foundShipCounter
            }
        }
        ws.send(JSON.stringify(msg))
    }

    //username input
    submitButton.on("click", function () {
        onSubmit();
    })

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
        headingA.text(formControl.val() + "'s Table")
        var msg = {
            type: "username",
            data: {
                name: username
            }
        }
        ws.send(JSON.stringify(msg))
        formControl.val("");
        submitButton.prop('disabled', true);

        if (username !== null) {
            submitButton.text('Update');
            formControl.attr('placeholder', 'Enter a new username');
        }
    }

    function generateRandomShips() {
        var shipLenghts = [5, 4, 3, 2]
        var numberOfShips = [1, 1, 2, 1]

        for (var i = 0; i < shipLenghts.length; i++) {
            var direction = getRandomInt(1, 2)

            for (var j = 0; j < numberOfShips[i]; j++) {
                var startCell = ""
                var endCell = ""

                if (direction === 1) { //horizontal 
                    do {
                        var row = getRandomInt(1, 10)
                        var col = getRandomInt(1, 10 - shipLenghts[i] + 1)
                        startCell = parseInt("" + (row - 1) + (col - 1)) //minus 1 bc of randomgenerator
                        endCell = startCell + shipLenghts[i]
                    } while (!areCellsFree(startCell, endCell, 1));
                } else { //vertical
                    do {
                        var row = getRandomInt(1, 10 - shipLenghts[i] + 1)
                        var col = getRandomInt(1, 10)
                        startCell = parseInt("" + (row - 1) + (col - 1))
                        endCell = parseInt("" + (row - 1 + shipLenghts[i]) + (col - 1))
                    } while (!areCellsFree(startCell, endCell, 10))
                }
            }
        }
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max * min)) + min;
    }

    function areCellsFree(start, end, increment) {
        var testGrid = gridArray
        for (var i = start; i < end; i += increment) {
            if (gridArray[i] === -1) {
                testGrid[i] = 1
            } else {
                return false
            }
        }

        gridArray = testGrid
        setShips(start, end, increment)
        return true
    }

    function setShips(start, end, increment) {
        for (var i = start; i < end; i += increment) {
            $('#' + i + "A").append($('<i>').addClass('material-icons').text('directions_boat'));
            $('#' + i + "A").attr('disabled', 'disabled');
        }
    }

});
