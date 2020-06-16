const dbQuery = require('../helper/db');

function post(tableName, value, value2,type) {
    let sql;
    var values = [];
    if(tableName !== undefined && tableName != null && value !== undefined){
        if(value2 !== undefined && value2 != null && type==="cells"){ //adding generated cells to db
            for(var i =0; i< value.length; i++){
                if(i === 99){
                    values.push(value[i], value2, i);
                } else {
                    values.push(value[i], value2, i);
                }
               
            }
            sql =  'INSERT INTO public.\"'+tableName+'VALUES($1:list, $2:list, $3:list);';

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
