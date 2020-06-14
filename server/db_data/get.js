const dbQuery = require('../helper/db');

async function get(tableName, clientId) {

        var sql;

        if(clientId != undefined && clientId != null){
                sql = 'SELECT * FROM public.\"' + tableName + '\" WHERE "clientID" = \''+clientId+'\';';
        }else{
                sql = 'SELECT * FROM public.\"' + tableName + '\";';
        }

        const result = await dbQuery(sql);

        if(result != undefined && result != null && result != 0){
                if(tableName == "battleshipUsers"){
                        return result.map(item => {
                                return {
                                        userName: item.userName,
                                        clientId: item.clientId || '',
                                }
                        });
                }else if(tableName == "generatedShipFields"){
                        console.log(result);
                        return result.map(item => {
                                return {
                                        cellId: item.cellId,
                                        battleshipUserId: item.battleshipUserId || '',
                                        status: item.status || '',
                                }
                        });
                }
        }else{
                console.log("ERROR: No clientId with " + clientId + "found");
        }
}

module.exports = get;
