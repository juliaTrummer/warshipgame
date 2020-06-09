const dbQuery = require('../../../../../../../../Downloads/ozwoldFH.github.io-master/server/helper/db');

async function get() {
    const sql = 'SELECT * FROM T_INVENTORY ORDER BY id DESC';
    const result = await dbQuery(sql);

    return result.map(item => {
        return {
            id: item.id,
            name: item.item_name || '',
            weight: item.weight || 0,
            description: item.description || '',
            location: item.location || '',
            room: item.room || '',
            type: item.item_type || '',
            addedDateTime: item.added_datetime || '',
            addedBy: item.added_by || '',
            lastServiceDateTime: item.last_service_datetime || '',
            lastServiceBy: item.last_service_by || '',
            nextServiceDateTime: item.next_service_datetime || '',
        };
    });
}

module.exports = get;
