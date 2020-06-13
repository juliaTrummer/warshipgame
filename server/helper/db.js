const { Pool } = require('pg')

const pool = new Pool({
    user: 'ykpdmzzslhfxng',
    host: 'ec2-54-75-231-215.eu-west-1.compute.amazonaws.com',
    database: 'd73ocv2t8c020',
    password: '02bf0f545f9b0acc26e130bcc4fb84ac1ce7fbc72c773b981569cdeaa709d679',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

function queryData(sql) {
    pool.query(sql, (err, res) => {
        console.log(err, res);
        pool.end();

    })
}

module.exports = queryData;
