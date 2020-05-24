module.exports = function(app) {
    const users = require('../controller/user.controller.js');

    // Retrieve all users
    app.get('/api/users', users.findAll);
}
