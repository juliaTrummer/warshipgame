$(function () {
    "use strict";

    var username = null;
    var formControl = $('.form-control');
    var greeting = $('#userGreeting');
    var grid = $('#tableGrid');
    var submitButton = $('#submitButton');
    var table = $('<table>');
    //---websocket---

    //table
    $(document).ready(function () {
        console.log('document is ready');
        createTable();
    });

    function createTable() {
        var tableBody = table;
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
                    var cell = $('<td>').addClass('tableCell field').click(function () { onCellClick($(this).attr('id')) }).attr('id', 'id' + id)
                    id++;
                }
                row.append(cell);
                tableBody.append(row);
            }
        }
        grid.append(tableBody);
    }

    //interaction with table
    function onCellClick(id) {
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

    formControl.keyup(function(e){
        if(e.which == 13 && formControl.val().length !== 0){
            onSubmit();
        } else if(formControl.val().length > 0){
            submitButton.prop('disabled', '1');
        } else if(formControl.val().length === 0){
            submitButton.prop('disabled', '1');
        }
    });

    function onSubmit(){
        greeting.text('Hello ' + formControl.val() + "!");

        //TODO: take this value for the prototype
        username = formControl.val();
        formControl.val("");
        submitButton.prop('disabled', true);

        if (username !== null) {
            submitButton.text('Update');
            formControl.attr('placeholder', 'Enter a new username');
        }
    }
});
