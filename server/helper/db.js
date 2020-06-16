const { Pool } = require('pg');

const pool = new Pool({
    user: 'ykpdmzzslhfxng',
    host: 'ec2-54-75-231-215.eu-west-1.compute.amazonaws.com',
    database: 'd73ocv2t8c020',
    password: '02bf0f545f9b0acc26e130bcc4fb84ac1ce7fbc72c773b981569cdeaa709d679',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0
});

async function queryData(query, values) {
    let res;
    if(values !== undefined && values != null){
        res = await pool.query(query, values);
    }else{
        res = await pool.query(query);
    }
    console.log(res);
    if (res.rows.length) {
        return [...res.rows];
    } else {
        return res.rowCount;
    }
}

module.exports = queryData;
