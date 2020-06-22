"use strict";

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
test('testing JEST is working', ()=>{
    expect(1).toBe(1);
});

//getting Data from DB without creating a User first
test('getUserFromDB', async () => {
    return getData(dbName, null, '123abc').then(data => {
        expect(data).toBe(undefined);
    });
});

test('postUserToDB', async () => {
   var data = await postData(dbName, userName, createdId);
   expect(data===undefined).toBe(true);
});

//should return user
test('getUserDataTrue', async ()=>{
    postData(dbName, userName, createdId);
    getData(dbName, null, createdId).then(data => {
        expect(data!=null).toBe(true);
    });
});

//should be undefined
test('deleteUserData', async ()=>{
    await deleteData('battleshipUsers');
    jest.setTimeout(30000);
    getData(dbName, null, createdId).then(data => {
        expect(data).toBe(undefined);
    });
});

test('putUserData', async  () =>{
    jest.setTimeout(30000);
    await putData(createdId, actualID);
    return getData(dbName, null, actualID).then(data => {
        expect(data!=null).toBe(false);
    });
});

test('getFieldsAfterDelete', async  () =>{
    await deleteData('generatedShipFields');
    jest.setTimeout(30000);
    return getData('generatedShipFields', 1, actualID).then(data => {
        expect(data).toBe(undefined);
    });
});
