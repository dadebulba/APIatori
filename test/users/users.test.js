const fetch = require('node-fetch');
const utils = require('../../utility');
const errors = require('../../errorMsg')

const USERS = require('../data/users.json')

const users_api = require("../../microservices/users/users");

let config = require('../../config/default.json');
const BASE_URL = config.baseURL;
const USERS_PORT = config.usersPort;
const USERS_ENDPOINT = `${BASE_URL}:${USERS_PORT}`;

/* -- MOCKS -- */
const user_data_layer = require('../../data_layer/user_data_layer/userDataLayer')
jest.mock('../../data_layer/user_data_layer/userDataLayer');

utils.validateAuth = jest.fn();
/* ---------- */


function mockManagerFunction(mockFun, behaviour) {
    return mockFun.mockImplementationOnce(() => {
        if (behaviour !== null && behaviour.prototype instanceof Error)
            throw new behaviour();
        else
            return behaviour;
    });
}

function mockReturn(mockFun, returnValue) {
    return mockFun.mockReturnValueOnce(returnValue);
}

beforeAll(async () => {
    await users_api.server_starting;
    //jest.setTimeout(100000); //evito che le richieste vadano in timeout troppo presto (mi serve per debug)
})

afterAll(() => {
    users_api.server.close();
});



describe("GET /users", () => {
    test("Success -> 200 (OK)", async () => {
        mockManagerFunction(user_data_layer.getAllUsers, new Promise(resolve => resolve(USERS)))
        mockReturn(utils.validateAuth, true);
        expect.assertions(2);
        let res = await fetch(`${USERS_ENDPOINT}/users`);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(USERS);
    });

    test("Failure -> 401 (Unauthorized)", async () => {
        mockReturn(utils.validateAuth, false);
        expect.assertions(2);
        let res = await fetch(`${USERS_ENDPOINT}/users`);
        let resJson = await res.json();
        expect(res.status).toBe(401);
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
    });
})

describe("GET /users/:id", () => {

    test("Success -> 200 (OK)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(user_data_layer.getUser, new Promise(resolve => resolve(USERS[0])))
        let res = await fetch(`${USERS_ENDPOINT}/users/first`);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(USERS[0]);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(false);
        let res = await fetch(`${USERS_ENDPOINT}/users/first`);
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);

    })

    test("Failure -> 404 (Not found)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(user_data_layer.getUser, new Promise(resolve => resolve(undefined)));
        let res = await fetch(`${USERS_ENDPOINT}/users/first`);
        let resJson = await res.json();
        expect(res.status).toBe(404);
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
    })

})

describe("POST /users", () => {

    test("Success -> 201 (Created)", async () => {
        const newUserData = {
            name : "John",
            surname : "Doe",
            mail : "john@doe.it",
            password : "password",
            phone : "1234567890" 
        }

        expect.assertions(2);
        mockManagerFunction(user_data_layer.createUser, new Promise(resolve => resolve(newUserData)));
        let res = await fetch(`${USERS_ENDPOINT}/users`, {
            method: 'post',
            body: JSON.stringify(newUserData),
            headers: { 'Content-Type': 'application/json' },
        })
        let resJson = await res.json();
        expect(resJson).toEqual(newUserData);
        expect(res.status).toBe(201);
    })
    
    test("Failure -> 400 (Bad request, undefined)", async () => {
        const newUserData = {
            name : "John",
            surname : "Doe",
            mail : "john@doe.it",
            password : "password",
            phone : "1234567890" 
        }
        expect.assertions(10);
        for(let property in newUserData) {
            newUserData[property] = undefined;
            let res = await fetch(`${USERS_ENDPOINT}/users`, {
                method: 'post',
                body: JSON.stringify(newUserData),
                headers: { 'Content-Type': 'application/json' },
            });
            let resJson = await res.json();
            expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
            expect(res.status).toBe(400);
        }
    })

    test("Failure -> 400 (Bad request, wrong email format)", async () => {
        const newUserData = {
            name : "John",
            surname : "Doe",
            mail : "wrongEmailFormat",
            password : "password",
            phone : "1234567890" 
        }

        expect.assertions(2);
        let res = await fetch(`${USERS_ENDPOINT}/users`, {
            method: 'post',
            body: JSON.stringify(newUserData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, not string)", async () => {
        const newUserData = {
            name : 123,
            surname : 456,
            mail : "john@doe.it",
            password : "password",
            phone : "1234567890" 
        }

        expect.assertions(2);
        let res = await fetch(`${USERS_ENDPOINT}/users`, {
            method: 'post',
            body: JSON.stringify(newUserData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, already registered)", async () => {
        const newUserData = {
            name : "John",
            surname : "Doe",
            mail : "john@doe.it",
            password : "password",
            phone : "1234567890" 
        }

        expect.assertions(2);
        mockManagerFunction(user_data_layer.createUser, new Promise(resolve => resolve(undefined)));
        let res = await fetch(`${USERS_ENDPOINT}/users`, {
            method: 'post',
            body: JSON.stringify(newUserData),
            headers: { 'Content-Type': 'application/json' },
        })
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ALREADY_PRESENT);
        expect(res.status).toBe(400);
    })
})
