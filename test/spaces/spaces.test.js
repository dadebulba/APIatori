const fetch = require('node-fetch');
const utils = require('../../utility');
const errors = require('../../errorMsg')

const BOOKINGS_1 = require('../data/bookings_1.json')
const SPACES = require('../data/spaces.json')

const spaces = require("../../microservices/spaces/spaces");

//process.env["NODE_CONFIG_DIR"] = "config";
const config = require('config');
const BASE_URL = config.get('baseURL');
const SPACE_PORT = config.get('spacesPort');
const spacesUrl = `${BASE_URL}:${SPACE_PORT}`;

/* -- MOCKS -- */
const space_data_layer = require('../../data_layer/space_data_layer/spaceDataLayer')
jest.mock("../../data_layer/space_data_layer/spaceDataLayer.js");

jest.mock("../../utility")
jest.mock("../../middleware/mwAuth", () => jest.fn((req, res, next) => next()))
/* ---------- */


function mockManagerFunction(mockFun, behaviour) {
    return mockFun.mockImplementationOnce(() => {
        if (behaviour !== null && behaviour.prototype instanceof Error)
            throw new behaviour();
        else
            return behaviour;
    });
}

function mockReturnValue(mockFun, returnValue) {
    return mockFun.mockReturnValue(returnValue);
}

beforeAll(async () => {
    await spaces.server_starting;
    //jest.setTimeout(100000); //evito che le richieste vadano in timeout troppo presto (mi serve per debug)
})

afterAll(() => {
    spaces.server.close();
});



describe("GET /spaces", () => {
    test("Success -> 200 (OK)", async () => {
        mockManagerFunction(space_data_layer.getAllSpaces, new Promise(resolve => resolve(SPACES)))
        expect.assertions(2);
        let res = await fetch(`${spacesUrl}/spaces`);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(SPACES);
    });
})

describe("GET /spaces/:id", () => {

    test("Success -> 200 (OK)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(space_data_layer.getSpace, new Promise(resolve => resolve(SPACES[0])))
        let res = await fetch(`${spacesUrl}/spaces/first`);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(SPACES[0]);
    })

    test("Failure -> 404 (Not found)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(space_data_layer.getSpace, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces/third`);
        let resJson = await res.json();
        expect(res.status).toBe(404);
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(false);
        mockManagerFunction(space_data_layer.getSpace, new Promise(resolve => resolve(SPACES[0])))
        let res = await fetch(`${spacesUrl}/spaces/first`);
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);

    })
})



describe("POST /spaces", () => {

    test("Success -> 401 (OK)", async () => {
        const newSpace = "stanza"
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(newSpace)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : "stanza"}),
            headers: { 'Content-Type': 'application/json' },
        });

        let resJson = await res.json();
        expect(resJson).toEqual(newSpace);
        expect(res.status).toBe(201);
        
    })


})

/*
describe("GET /spaces/{spaceId}/bookings", () => {
    let options;
    beforeAll(() => {
        options = {
			method: 'GET',
			headers : tokenHeader
        };
    });

    test("Success -> 200 (OK)", async () => {
        expect.assertions(2);
        let res = await fetch(`${spacesUrl}/1/bookings`, options);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(bookings_1);
    });

    test("Failed -> 404 (Not found) :: Id not valid", async () => {

        expect.assertions(2);
        let res = await fetch(`${spacesUrl}/2/bookings`, options);
        let jsonRes = await res.json();
        expect(res.status).toBe(404);
        expect(jsonRes).toEqual(errors.ENTITY_NOT_FOUND);
        
    });
})
*/