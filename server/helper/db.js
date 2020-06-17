const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
