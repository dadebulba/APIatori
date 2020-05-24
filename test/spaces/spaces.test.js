const fetch = require('node-fetch');
const utils = require('../../utility');
const errors = require('../../errorMsg')

const BOOKINGS_1 = require('../data/bookings_1.json')
const SPACES = require('../data/spaces.json')

const space_data_layer = require('../../data_layer/space_data_layer/spaceDataLayer')

process.env["NODE_CONFIG_DIR"] = "config";
const config = require('config');
const BASE_URL = config.get('baseURL');
const SPACE_PORT = config.get('spacesPort');
const spacesUrl = `${BASE_URL}:${SPACE_PORT}`;

jest.mock('../../middleware/mwAuth.js', () => jest.fn((req, res, next) => {
    req['uid'] = "123";
    req['role'] = "admin";
    next()
}));

function mockManagerFunction(mockFun, behaviour) {
    return mockFun.mockImplementationOnce(() => {
        if (behaviour !== null && behaviour.prototype instanceof Error)
            throw new behaviour();
        else
            return behaviour;
    });
}

jest.mock("../../data_layer/space_data_layer/spaceDataLayer.js");

beforeAll(() => {
    jest.resetAllMocks();
    jest.setTimeout(100000); //evito che le richieste vadano in timeout troppo presto (mi serve per debug)
})

describe("GET /spaces", () => {
    beforeAll(() => {
        mockManagerFunction(space_data_layer.getAllSpaces, new Promise(resolve => resolve(SPACES)))
        mockManagerFunction(space_data_layer.getSpace, new Promise(resolve => resolve(SPACES[0])))
    });

    test("Success -> 200 (OK)", async () => {
        expect.assertions(2);
        let res = await fetch(`${spacesUrl}`);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(SPACES);
    });
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