const fetch = require('node-fetch');
const utils = require('../../utility');
const errors = require('../../errorMsg')
var http = require('http');
var mockserver = require('mockserver');


var bookings_1 = require('../data/bookings_1.json')
process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config');

const SPACE_DL_PORT = config.get('spaceDataLayerPort');
const USER_DL_PORT = config.get('userDataLayerPort');

const BASE_URL = config.get('baseURL');
const SPACE_PORT = config.get('spacesPort');
const TOKEN_PORT = config.get('tokenPort');

const spacesUrl = `${BASE_URL}:${SPACE_PORT}`;
const tokenUrl = `${BASE_URL}:${TOKEN_PORT}/token`;
	
http.createServer(mockserver('./mock')).listen(SPACE_DL_PORT);
http.createServer(mockserver('../users/mock')).listen(USER_DL_PORT);

let tokenHeader = null;

beforeAll(async () => {
	
	token = await utils.getAuthHeader("ciccio@pasticcio.it", "asd", tokenUrl)
	console.log(token);
    jest.setTimeout(100000); //evito che le richieste vadano in timeout troppo presto (mi serve per debug)
})


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
