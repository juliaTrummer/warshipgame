const dbQuery = require('../helper/db');

function post(tableName, value, value2, fieldStatus) {
    let sql;
    if(tableName !== undefined && tableName != null && value !== undefined){
        if(value2 !== undefined && value2 != null && fieldStatus!== undefined && fieldStatus!=null ){
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\', \''+value2+'\' , \''+fieldStatus+'\');';
        } else if(value2 !== undefined && value2 != null){
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\', \''+value2+'\');';
        } else{
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\');';
        }
        console.log("INFO - " + sql);
        dbQuery(sql);
    }else{
        console.log("ERROR: Query Syntax");
    }
}

module.exports = post;
