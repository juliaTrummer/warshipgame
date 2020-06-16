const dbQuery = require('../helper/db');

function post(tableName, value, value2, fieldStatus) {
    let sql;
    var values;
    if(tableName !== undefined && tableName != null && value !== undefined){
        if(value2 !== undefined && value2 != null && fieldStatus!== undefined && fieldStatus!=null ){
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES ($1, $2, $3);';
            values = [value, value2,  fieldStatus];
        } else if(value2 !== undefined && value2 != null){
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES ($1, $2);';
            values = [value, value2];
        } else{
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES ($1);';
            value = [value]
        }
        dbQuery(sql, values);
    }else{
        console.log("ERROR: Variables not defined!");
    }
}

module.exports = post;
