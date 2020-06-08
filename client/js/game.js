$(function () {
    "use strict";

    var username = null;
    var formControl = $('.form-control');
    var gridA = $('#tableGridA');
    var gridB= $('#tableGridB');
    var submitButton = $('#submitButton');
    var headingA = $('#headingA');
    var gridArray = new Array(100).fill(-1);
    //---websocket---


    $(document).ready(function () {
        createTable(gridA, "A");
        createTable(gridB, "B");
        generateRandomShips();
    });

    function createTable(gridType, idType) {
        var tableBody = gridType;
        var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        var id = 1;
        
        for (var i = 0; i < 12; i++) {
            
            var row = $('<tr>');
            for (var j = 0; j < 12; j++) {
                if ((j === 0 || j === 11) && (i !== 0 && i !== 11)) {
                    var cell = $('<td>').addClass('tableCell numbering').text(alphabet[i - 1]);
                } else if ((i === 0 || i === 11) && (j !== 0 && j !== 11)) {
                    var cell = $('<td>').addClass('tableCell numbering').text(j);
                } else if (((i === 0 || i === 11) && (j == 0 || j == 11)) || ((j === 0 || j === 11) && (i == 0 || i == 11))) {
                    var cell = $('<td>');
                } else {
                    if(idType==="A"){
                        var cell = $('<td>').addClass('tableCell field').click(function () { onCellClick($(this).attr('id')) }).attr('id', 'id' + id+idType).attr('disabled', 'disabled');
                    } else {
                        var cell = $('<td>').addClass('tableCell field').click(function () { onCellClick($(this).attr('id')) }).attr('id', 'id' + id+idType)
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
        getRandomInt()
        if ($('#' + id).attr('disabled') === 'disabled') {
            return;
        }
        $('#' + id).append($('<i>').addClass('material-icons').text('directions_boat'));
        $('#' + id).attr('disabled', 'disabled');
        console.log('clicked on cell: ' + id);
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
        headingA.text(formControl.val()+"'s Table")
       // connection.send(username) websocket
        formControl.val("");
        submitButton.prop('disabled', true);

        if (username !== null) {
            submitButton.text('Update');
            formControl.attr('placeholder', 'Enter a new username');
        }
    }

    function generateRandomShips(){
        //1 x 4 cells

        //2 x 3 cells

        //3 x 2 cells

        //4 x 1 cells
    }

    function getRandomInt(){
        return Math.floor(Math.random()*(100 * 1)) + 1;
    }

});
