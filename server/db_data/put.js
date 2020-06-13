const dbQuery = require('../helper/db.js');

function put(tableName, value1, column1, value2, column2) {
    if(tableName != undefined && tableName != null){
        var sql =  'UPDATE public.\"'+tableName+'\" SET \"'+column1+'\" = \''+value1+'\' WHERE \"'+column2+'\" = \''+value2+'\';'
        dbQuery(sql)
    }else{
        console.log("ERROR: Query Syntax")
    }
}

module.exports = put;
