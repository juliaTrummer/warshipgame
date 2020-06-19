const dbQuery = require('../helper/db');
const format = require('pg-format');

function post(tableName, value, value2, type) {
    let sql;
    var values = [];
    if(tableName !== undefined && tableName != null && value !== undefined){
        if(value2 !== undefined && value2 != null && type==="cells"){ //adding generated cells to db
            for(var i =0; i< value.length; i++){
                    values.push([value[i], value2, i]);
                    if(i === 99){
                        sql = format('INSERT INTO public.\"'+tableName+'\" (status, clientid, cellid) VALUES %L', values);
                        dbQuery(sql);
                    }

            }
        } else if(value2 !== undefined && value2 != null){
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES ($1, $2);';
            values = [value, value2];
            dbQuery(sql, values);
        } else{
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES ($1);';
            values = [value]
            dbQuery(sql, values);
        }
    }else{
        console.log("ERROR: Variables not defined!");
    }
}

module.exports = post;
