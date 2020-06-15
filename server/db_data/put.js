const dbQuery = require('../helper/db.js');

function put(tableName, value1, column1, value2, column2) {
    if(tableName !== undefined && tableName != null && value1 !== undefined && value1 != null
        && column1 !== undefined && column1 != null && value2 !== undefined && value2 != null
        && column2 !== undefined && column2 != null) {
        var sql =  'UPDATE public.\"'+tableName+'\" SET \"'+column1+'\" = \''+value1+'\' WHERE \"'+column2+'\" = \''+value2+'\';'
        console.log(sql);
        dbQuery(sql)

    }else{
        console.log("ERROR: Query Syntax")
    }
}

module.exports = put;
