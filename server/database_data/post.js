const dbQuery = require('../../../../../../../../Downloads/ozwoldFH.github.io-master/server/helper/db');

async function post(newItems) {
    try {
        if (!newItems.length) {
            throw {code: 400, message: 'body must be a array'};
        }
        let valueIndex = 1;
        const sqlValues = newItems.map(newItem => '(' + Array(11).fill(0).map(v => `$${valueIndex++}`).join(',') + ')').join(',');
        const sql = {
            text: 'INSERT INTO T_INVENTORY (item_name,weight,description,location,room,item_type,added_datetime,added_by,last_service_datetime,last_service_by,next_service_datetime)' +
                ' VALUES ' + sqlValues,
            values: [],
        };

        const now = new Date();
        newItems.forEach(newItem => {
            if (!newItem.name || !newItem.weight || !newItem.description || !newItem.location
                || !newItem.room || !newItem.type || !newItem.addedBy) {
                throw {code: 400, message: 'data is invalid'};
            }

            if (!newItem.addedDateTime) {
                throw {code: 400, message: 'addedDateTime is required'};
            } else if (!(now > new Date(newItem.addedDateTime))) {
                throw {code: 400, message: 'addedDateTime has to be in the past'};
            }
            if (!newItem.lastServiceDateTime && !newItem.lastServiceBy) {
                newItem.lastServiceDateTime = null;
            } else if (newItem.lastServiceDateTime ^ newItem.lastServiceBy) {
                throw {code: 400, message: 'lastServiceDateTime and lastServiceBy must be set or none of them'};
            } else if (!(now > new Date(newItem.lastServiceDateTime))) {
                throw {code: 400, message: 'lastServiceDateTime has to be in the past'};
            }
            if (!newItem.nextServiceDateTime) {
                newItem.nextServiceDateTime = null;
            } else if (!(now < new Date(newItem.nextServiceDateTime))) {
                throw {code: 400, message: 'nextServiceDate has to be in the future'};
            }

            sql.values.push(newItem.name);
            sql.values.push(newItem.weight);
            sql.values.push(newItem.description);
            sql.values.push(newItem.location);
            sql.values.push(newItem.room);
            sql.values.push(newItem.type);
            sql.values.push(newItem.addedDateTime);
            sql.values.push(newItem.addedBy);
            sql.values.push(newItem.lastServiceDateTime);
            sql.values.push(newItem.lastServiceBy);
            sql.values.push(newItem.nextServiceDateTime);
        });

        const result = await dbQuery(sql);
        return result;
    } catch (err) {
        throw {
            code: err.code,
            message: err.message,
        }
    }
}

module.exports = post;
