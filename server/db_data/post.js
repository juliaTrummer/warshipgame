const dbQuery = require('../helper/db');

function post(tableName, value, value2,type) {
    let sql;
    if(tableName !== undefined && tableName != null && value !== undefined){
        if(value2 !== undefined && value2 != null && type==="cells"){ //adding generated cells to db
            var query = " VALUES ";
            for(var i =0; i< value.length; i++){
                if(i === 99){
                    query+='(\''+value[i]+'\', \''+value2+'\' , \''+i+'\');'
                } else {
                     query+='(\''+value[i]+'\', \''+value2+'\' , \''+i+'\'),'
                }
               
            }
            sql =  'INSERT INTO public.\"'+tableName+'\"'+query;

        } else if(value2 !== undefined && value2 != null){
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\', \''+value2+'\');';
        } 
        else{
            sql =  'INSERT INTO public.\"'+tableName+'\" VALUES (\''+value+'\');';
        }
        console.log("INFO - " + sql);
        dbQuery(sql);
    }else{
        console.log("ERROR: Query Syntax");
    }
}

module.exports = post;
