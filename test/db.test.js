"use strict";

const assert = require('assert');
const getData = require('../server/db_data/get');
const postData = require('../server/db_data/post');
const deleteData = require('../server/db_data/delete');
const putData = require('../server/db_data/put');
const { v4: uuidv4 } = require('uuid');

const dbName = 'battleshipUsers';
const userName = 'user1';
const createdId = uuidv4();
const actualID = '690906d8-2c38-4f0c-a5e0-3e3ea4bd08fb';

//test if  JEST works
test('Testing JEST ist working', ()=>{
    expect(1).toBe(1)
})

//getting Data from DB without creating a User first
test('getUserFromDB', async () => {
    return getData(dbName, null, '123abc').then(data => {
        expect(data).toBe(undefined)
    });
});

test('postUserToDB', async () => {
    postData(dbName, userName, createdId);
});

test('getUserDataTrue', async ()=>{
    return getData(dbName, null, actualID).then(data => {
        expect(data!=null).toBe(true)
    });
})
