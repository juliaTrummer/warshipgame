const dbQuery = require('../helper/db');

function post(tableName, value, value2) {
    if(tableName != undefined && tableName != null && value != undefined && value !=null){
        if(value2 != undefined && value2 != null){
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\', \''+value2+'\');';
            dbQuery(sql);
        }else{
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\');';
            dbQuery(sql);
        }
    }else{
        console.log("ERROR: Query Syntax");
    }
}

module.exports = post;
