const dbQuery = require('../helper/db.js');

function put(value1, value2) {
    if(value1 !== undefined && value1 != null && value2 !== undefined && value2 != null) {
        var sql =  'UPDATE public.\"battleshipUsers\" SET \"userName\" = ($1) WHERE \"clientID\" = ($2);';
        var values = [value1, value2];
        dbQuery(sql, values);
    }else{
        console.log("ERROR: no values defined")
    }
}

module.exports = put;
