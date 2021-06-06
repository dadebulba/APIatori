const fetch = require('node-fetch');
const utils = require('../../utility');
const errors = require('../../errorMsg')

const BOOKINGS_1 = require('../data/bookings_1.json')
const SPACES = require('../data/spaces.json')


let config = require('../../config/default.json');
const BASE_URL = config.baseURL;
const SPACE_PORT = config.spacesPort;
const spacesUrl = `${BASE_URL}:${SPACE_PORT}`;

/* -- MOCKS -- */
const space_data_layer = require('../../data_layer/space_data_layer/spaceDataLayer')
jest.mock("../../data_layer/space_data_layer/spaceDataLayer.js");
utils.validateAuth = jest.fn();
utils.unless = jest.fn();
utils.unless.mockImplementation((middleware, ...excludedUrl) => {
    return function(req, res, next){
        next();       
    }
})
const spaces = require("../../microservices/spaces/spaces");

jest.mock("../../middleware/mwAuth", () => jest.fn((req, res, next) =>  next()))
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
    afterEach(() => {
        jest.resetAllMocks();
    })
    
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
    test("Success -> 201 (Created)", async () => {
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

    test("Failure -> 401 (Unauthorized)", async () => {
        const editedSpace = "stanza"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, false)
        mockManagerFunction(space_data_layer.modifySpace, new Promise(resolve => resolve(editedSpace)))
        let res = await fetch(`${spacesUrl}/spaces/ciao`, {
            method: 'put',
            body:    JSON.stringify({name : editedSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })

    test("Failure -> 400 (Bad request, params undefined)", async () => {
        const editedSpace = undefined
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.modifySpace, new Promise(resolve => resolve(editedSpace)))
        let res = await fetch(`${spacesUrl}/spaces/ciao`, {
            method: 'put',
            body:    JSON.stringify({name : editedSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
        expect(res.status).toBe(400);
    })

    test("Failure -> 404 (Not found)", async () => {
        const editedSpace = "space"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.modifySpace, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces/ciao`, {
            method: 'put',
            body:    JSON.stringify({name : editedSpace}),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
})

describe("DELETE /spaces/:id", () => {

    afterEach(() => {
        jest.resetAllMocks();
    })
    test("Success -> 200 (OK)", async () => {
        const spaceToRemove = "space1"
        expect.assertions(1);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.deleteSpace, new Promise(resolve => {
            resolve(spaceToRemove)
        }))
        let res = await fetch(`${spacesUrl}/spaces/${spaceToRemove}`, {
            method: 'delete',
        });
        expect(res.status).toBe(200);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        const spaceToRemove = "space1"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, false)
        let res = await fetch(`${spacesUrl}/spaces/${spaceToRemove}`, {
            method: 'delete',
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })

    test("Failure -> 404 (Not found)", async () => {
        const spaceToRemove = "space1"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.deleteSpace, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces/${spaceToRemove}`, {
            method: 'delete',
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
})

describe("GET /spaces/:spaceId/bookings", () => {
    afterEach(() => {
        jest.resetAllMocks();

    })
    test("Success -> 200 (OK)", async () => {
        const spaceId = "space1"
        expect.assertions(2);
        mockManagerFunction(space_data_layer.getAllBookingsForSpace, new Promise(resolve => {
            resolve(BOOKINGS_1)
        }))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`);
        let resJson = await res.json();
        expect(resJson).toEqual(BOOKINGS_1);
        expect(res.status).toBe(200);
    })

    test("Failure -> 404 (Not found)", async () => {
        const spaceId = "space2"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.getAllBookingsForSpace, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`);
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
})

describe("GET /spaces/:spaceId/bookings/:bookingId", () => {

    afterEach(() => {
        jest.resetAllMocks();
    })
    test("Success -> 200 (OK)", async () => {
        const spaceId = "space1"
        const bookingId = "booking1"
        expect.assertions(2);
        mockManagerFunction(space_data_layer.getBookingForSpace, new Promise(resolve => {
            resolve(BOOKINGS_1[0])
        }))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingId}`);
        let resJson = await res.json();
        expect(resJson).toEqual(BOOKINGS_1[0]);
        expect(res.status).toBe(200);
    })

    test("Failure -> 404 (Not found)", async () => {
        const spaceId = "space2"
        const bookingId = "bookingNotFound"
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.getBookingForSpace, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}`);
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
})

describe("POST /spaces/:spaceId/bookings", () => {

    afterEach(() => {
        jest.resetAllMocks();
    })

    test("Success -> 201 (Created)", async () => {
        const spaceId = "space2"
        const newBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita",
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(space_data_layer.createBookingForSpace, 
            new Promise(resolve => resolve(newBooking)))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`, {
            method: 'post',
            body:    JSON.stringify(newBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(newBooking);
        expect(res.status).toBe(201);
    })

    test("Failure -> 400 (Bad request, undefined)", async () => {
        const spaceId = "space2"
        let newBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita",
        }
        expect.assertions(8);
        utils.validateAuth.mockReturnValue(true);
        for(let property in newBooking) {
            newBooking[property] = undefined;
            let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`, {
                method: 'post',
                body:    JSON.stringify(newBooking),
                headers: { 'Content-Type': 'application/json' },
            });
            let resJson = await res.json();
            expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
            expect(res.status).toBe(400);
        }
    })

    test("Failure -> 400 (Bad request, booking type not valid)", async () => {
        const spaceId = "space2"
        const newBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "random",
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`, {
            method: 'post',
            body:    JSON.stringify(newBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    /*
    test("Failure -> 400 (Bad request, date time invalid)", async () => {
        const spaceId = "second"
        const newBooking = {
            gid : "MOCK_Group2",
            from : "1234",
            to: "5678",
            type : "attivita",
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`, {
            method: 'post',
            body:    JSON.stringify(newBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.DATETIME_INVALID);
        expect(res.status).toBe(400);
    })
    */

    test("Failure -> 401 (Unauthorized)", async () => {
        const spaceId = "space1"
        const newBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita",
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(false);
        
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`, {
            method: 'post',
            body:    JSON.stringify(newBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })

    test("Failure -> 404 (Not found)", async () => {
        const spaceId = "spaceNotFound"
        const newBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita",
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(space_data_layer.createBookingForSpace, 
            new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings`, {
            method: 'post',
            body:    JSON.stringify(newBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
})

describe("PUT /spaces/:spaceId/bookings/:bookingId", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })

    test("Success -> 200 (OK)", async () => {
        const spaceId = "space2"
        const bookingId = "booking1"
        const editedBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita"
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(space_data_layer.getBookingForSpace,
            new Promise(resolve => resolve(BOOKINGS_1[0])))
        mockManagerFunction(space_data_layer.modifyBookingForSpace, 
            new Promise(resolve => resolve(editedBooking)))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingId}`, {
            method: 'put',
            body:    JSON.stringify(editedBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(editedBooking);
        expect(res.status).toBe(200);
    })

    test("Failure -> 400 (Bad request, undefined)", async () => {
        const spaceId = "space2"
        const bookingId = "booking1"
        let editedBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita",
        }
        expect.assertions(8);
        utils.validateAuth.mockReturnValue(true);
        for(let property in editedBooking) {
            editedBooking[property] = undefined;
            let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingId}`, {
                method: 'put',
                body:    JSON.stringify(editedBooking),
                headers: { 'Content-Type': 'application/json' },
            });
            let resJson = await res.json();
            expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
            expect(res.status).toBe(400);
        }
    })

    test("Failure -> 400 (Bad request, booking type not valid)", async () => {
        const spaceId = "space2"
        const bookingId = "booking1"
        const editedBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "notValidType"
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingId}`, {
            method: 'put',
            body:    JSON.stringify(editedBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, date time invalid)", async () => {
        const spaceId = "space2"
        const bookingId = "booking1"
        const editedBooking = {
            gid : "123",
            from : "thisDateIsInvalid",
            to: "1234",
            type : "attivita"
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingId}`, {
            method: 'put',
            body:    JSON.stringify(editedBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.DATETIME_INVALID);
        expect(res.status).toBe(400);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        const spaceId = "space2"
        const bookingId = "booking1"
        const editedBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita"
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(false);
        mockManagerFunction(space_data_layer.getBookingForSpace,
            new Promise(resolve => resolve(BOOKINGS_1[0])))

        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingId}`, {
            method: 'put',
            body:    JSON.stringify(editedBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })

    test("Failure -> 404 (Not found)", async () => {
        const spaceId = "space2"
        const bookingId = "booking1"
        const editedBooking = {
            gid : "123",
            from : "2020-01-01T14:00:00",
            to: "2020-01-01T15:00:00",
            type : "attivita"
        }
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(space_data_layer.modifyBookingForSpace, 
            new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingId}`, {
            method: 'put',
            body:    JSON.stringify(editedBooking),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
    
})


describe("DELETE /spaces/:spaceId/bookings/:bookingId", () => {
    beforeEach(() => {
        mockManagerFunction(space_data_layer.getBookingForSpace,
            new Promise(resolve => resolve(BOOKINGS_1[0])));
    })

    afterEach(() => {
        jest.resetAllMocks();
    })
    test("Success -> 200 (OK)", async () => {
        const spaceId = "space1";
        const bookingToRemove = "booking1";
        expect.assertions(1);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.deleteBookingForSpace, new Promise(resolve => {
            resolve(BOOKINGS_1[0])
        }))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingToRemove}`, {
            method: 'delete',
        });
        expect(res.status).toBe(200);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        const spaceId = "space1";
        const bookingToRemove = "booking1";
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, false)
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingToRemove}`, {
            method: 'delete',
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })
    
    test("Failure -> 404 (Not found)", async () => {
        const spaceId = "space1";
        const bookingToRemove = "booking1";
        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true)
        mockManagerFunction(space_data_layer.deleteBookingForSpace, new Promise(resolve => {
            resolve(undefined)
        }))
        let res = await fetch(`${spacesUrl}/spaces/${spaceId}/bookings/${bookingToRemove}`, {
            method: 'delete',
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
})