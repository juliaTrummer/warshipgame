const db = require('../config/db.config.js');
const User = db.users;

// FETCH all users
exports.findAll = (req, res) => {
    User.findAll().then(users => {
        // Send all users to Client
        res.send(users);
    });
};
