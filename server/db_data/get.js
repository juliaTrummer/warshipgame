const dbQuery = require('../helper/db');

function get(tableName) {
    if(tableName != undefined && tableName != null){
        var sql = 'SELECT * FROM public.\"'+tableName+'\";'
        dbQuery(sql)
    }else{
        console.log("ERROR: Query Syntax")
    }
}

module.exports = get;
