const dbQuery = require('../helper/db');

function post(tableName, value) {
    if(tableName != undefined && tableName != null && value != undefined && value !=null){
        sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\');';
        dbQuery(sql);
    }else{
        console.log("ERROR: Query Syntax");
    }
}

module.exports = post;
