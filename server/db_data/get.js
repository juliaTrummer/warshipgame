const dbQuery = require('../helper/db');

async function get(tableName, fieldId, clientId) {

        var sql;

        if(clientId !== undefined && clientId != null && fieldId !== undefined && fieldId != null){
                sql = 'SELECT * FROM public.\"' + tableName + '\" WHERE NOT "clientid" = \''+clientId+'\' AND "cellid" = '+fieldId+';';
        }else if (clientId !== undefined && clientId != null) {
                sql = 'SELECT * FROM public.\"' + tableName + '\" WHERE "clientID" = \''+clientId+'\';';
        }else{
                sql = 'SELECT * FROM public.\"' + tableName + '\";';
        }

        const result = await dbQuery(sql);

        if(result !== undefined && result !== 0){
                if(tableName === "battleshipUsers"){
                        return result.map(item => {
                                return {
                                        userName: item.userName,
                                        clientID: item.clientID || '',
                                }
                        });
                }else if(tableName === "generatedShipFields"){
                        console.log(result);
                        return result.map(item => {
                                return {
                                        cellId: item.cellId,
                                        battleshipUserId: item.battleshipUserId || '',
                                        status: item.status || '',
                                }
                        });
                }
        }
}

module.exports = get;
