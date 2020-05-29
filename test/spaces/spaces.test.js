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
utils.validateAuth = jest.fn();
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
    afterEach(() => {
        jest.resetAllMocks();
    })
    test("Success -> 200 (OK)", async () => {
        const newSpace = "stanza"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(newSpace)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : newSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(newSpace);
        expect(res.status).toBe(201);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        const newSpace = "stanza"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, false)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(newSpace)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : "stanza"}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })

    test("Failure -> 400 (Bad request, params undefined)", async () => {
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve("ciao")))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : undefined}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, params not string)", async () => {
        const newSpace = 123;
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(newSpace)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : newSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, already present)", async () => {
        const newSpace = "ciao";
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : newSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ALREADY_PRESENT);
        expect(res.status).toBe(400);
    })
})

describe("PUT /spaces/:id", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    test("Success -> 200 (OK)", async () => {
        const editedSpace = "stanza"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.modifySpace, new Promise(resolve => {
            resolve(editedSpace)
        }))
        let res = await fetch(`${spacesUrl}/spaces/ciao`, {
            method: 'put',
            body:    JSON.stringify({name : editedSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(editedSpace);
        expect(res.status).toBe(200);
    })
/*
    test("Failure -> 401 (Unauthorized)", async () => {
        const newSpace = "stanza"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, false)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(newSpace)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : "stanza"}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })

    test("Failure -> 400 (Bad request, params undefined)", async () => {
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve("ciao")))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : undefined}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, params not string)", async () => {
        const newSpace = 123;
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(newSpace)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : newSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, already present)", async () => {
        const newSpace = "ciao";
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.createSpace, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces`, {
            method: 'post',
            body:    JSON.stringify({name : newSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ALREADY_PRESENT);
        expect(res.status).toBe(400);
    })
    */
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