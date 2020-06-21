const dbQuery = require('../helper/db');

function deleteRow(tableName) {
    if(tableName !== undefined){
        var sql =  'DELETE FROM public.\"'+tableName+'\";';
        dbQuery(sql)
    }else{
        console.log("ERROR: Query Syntax")
    }
}

module.exports = deleteRow;
