const env = {
    database: 'd73ocv2t8c020',
    username: 'ykpdmzzslhfxng',
    password: '02bf0f545f9b0acc26e130bcc4fb84ac1ce7fbc72c773b981569cdeaa709d679',
    host: 'ec2-54-75-231-215.eu-west-1.compute.amazonaws.com',
    port: 5432,
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

module.exports = env;
