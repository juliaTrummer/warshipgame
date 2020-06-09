const dbQuery = require('../../../../../../../../Downloads/ozwoldFH.github.io-master/server/helper/db');

async function deleteRow({id}) {
    try {
        const sql = {
            text: `DELETE FROM T_INVENTORY WHERE id = $1;`,
            values: [id]
        };
        const result = await dbQuery(sql);
        return result;
    } catch (err) {
        throw {
            code: Number(err.code) || 500,
            message: err.message,
        }
    }
}

module.exports = deleteRow;
