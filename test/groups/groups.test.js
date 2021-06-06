const fetch = require('node-fetch');
const utils = require('../../utility');
const errors = require('../../errorMsg')

const GROUPS = require('../data/groups.json')

let groups = require("../../microservices/groups/groups");

let config = require('../../config/default.json');

const BASE_URL = config.baseURL;
const GROUP_PORT = config.groupsPort;
const groupsEndpoint = `${BASE_URL}:${GROUP_PORT}`;

/* -- MOCKS -- */
const group_data_layer = require('../../data_layer/group_data_layer/groupDataLayer')
jest.mock('../../data_layer/group_data_layer/groupDataLayer');

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

function mockReturn(mockFun, returnValue) {
    return mockFun.mockReturnValueOnce(returnValue);
}

beforeAll(async () => {
    groups.addGroupToUsers = jest.fn().mockReturnValue(new Promise(resolve => resolve(true)));
    groups.deleteGroupToUsers = jest.fn().mockReturnValue(new Promise(resolve => resolve(true)));
    groups.updateGroupToUsers = jest.fn().mockReturnValue(new Promise(resolve => resolve(true)));
    groups.validateUsers = jest.fn();
    await groups.server_starting;
    //jest.setTimeout(100000); //evito che le richieste vadano in timeout troppo presto (mi serve per debug)
    
})
afterAll(() => {
    groups.server.close();
});

describe("GET /groups", () => {
    test("Success -> 200 (OK)", async () => {
        mockManagerFunction(group_data_layer.getAllGroups, new Promise(resolve => resolve(GROUPS)))
        mockReturn(utils.validateAuth, true);
        expect.assertions(2);
        let res = await fetch(`${groupsEndpoint}/groups`);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(GROUPS);
    });

    test("Failure -> 401 (Unauthorized)", async () => {
        mockManagerFunction(group_data_layer.getAllGroups, new Promise(resolve => resolve(GROUPS)))
        mockReturn(utils.validateAuth, false);
        expect.assertions(2);
        let res = await fetch(`${groupsEndpoint}/groups`);
        let resJson = await res.json();
        expect(res.status).toBe(401);
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
    });
})

describe("GET /groups/:id", () => {

    test("Success -> 200 (OK)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(group_data_layer.getGroup, new Promise(resolve => resolve(GROUPS[0])))
        let res = await fetch(`${groupsEndpoint}/groups/first`);
        let resJson = await res.json();
        expect(res.status).toBe(200);
        expect(resJson).toEqual(GROUPS[0]);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(false);
        //mockManagerFunction(group_data_layer.getGroup, new Promise(resolve => resolve(GROUPS[0])))
        let res = await fetch(`${groupsEndpoint}/groups/first`);
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);

    })

    test("Failure -> 404 (Not found)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(group_data_layer.getGroup, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${groupsEndpoint}/groups/third`);
        let resJson = await res.json();
        expect(res.status).toBe(404);
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
    })

})

describe("POST /groups", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })
    test("Success -> 201 (Created)", async () => {
        const name = "Groups1";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        const newGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true);
        mockManagerFunction(groups.validateUsers, new Promise(resolve => resolve(true)));
        mockManagerFunction(group_data_layer.createGroup, new Promise(resolve => resolve(newGroupData)));
        let res = await fetch(`${groupsEndpoint}/groups`, {
            method: 'post',
            body: JSON.stringify(newGroupData),
            headers: { 'Content-Type': 'application/json' },
        })
        let resJson = await res.json();
        expect(resJson).toEqual(newGroupData);
        expect(res.status).toBe(201);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        const name = "Groups1";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        const newGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }
        expect.assertions(2);
        groups.validateUsers.mockReturnValue(new Promise(resolve => resolve(true)))
        mockManagerFunction(utils.validateAuth, false)
        let res = await fetch(`${groupsEndpoint}/groups`, {
            method: 'post',
            body: JSON.stringify(newGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })
    
    test("Failure -> 400 (Bad request, undefined)", async () => {
        let name = "Groups1";
        let educators = ["John", "Mary"];
        let collabs = ["Patrick", "Violet"]
        let guys = ["Lucas", "Pippo", "Alice"]

        let newGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }
        expect.assertions(8);
        utils.validateAuth.mockReturnValue(true);
        for(let property in newGroupData) {
            newGroupData[property] = undefined;
            let res = await fetch(`${groupsEndpoint}/groups`, {
                method: 'post',
                body: JSON.stringify(newGroupData),
                headers: { 'Content-Type': 'application/json' },
            });
            let resJson = await res.json();
            expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
            expect(res.status).toBe(400);
        }
    })
    test("Failure -> 400 (Bad request, params not array or empty)", async () => {
        let name = "Groups1";
        let educators = [];
        let collabs = "notAnArray"
        let guys = []

        let newGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${groupsEndpoint}/groups`, {
            method: 'post',
            body: JSON.stringify(newGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.EMPTY_ARRAY);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, not string)", async () => {
        const name = 123;
        const educators = [567, "Mary"];
        const collabs = ["Patrick", 897]
        const guys = ["Lucas", 111, "Alice"]

        let newGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${groupsEndpoint}/groups`, {
            method: 'post',
            body: JSON.stringify(newGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, not valid users)", async () => {
        const name = "Groups1";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        let newGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        groups.validateUsers.mockReturnValue(new Promise(resolve => resolve(false)))
        //mockManagerFunction(groups.validateUsers, new Promise(resolve => resolve(false)))
        let res = await fetch(`${groupsEndpoint}/groups`, {
            method: 'post',
            body: JSON.stringify(newGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.WRONG_USERS);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, group already present)", async () => {
        const name = "Groups1";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        const newGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true);
        groups.validateUsers.mockReturnValue(new Promise(resolve => resolve(true)))
        group_data_layer.createGroup.mockReturnValue(new Promise(resolve => resolve(undefined)));
        let res = await fetch(`${groupsEndpoint}/groups`, {
            method: 'post',
            body: JSON.stringify(newGroupData),
            headers: { 'Content-Type': 'application/json' },
        })
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ALREADY_PRESENT);
        expect(res.status).toBe(400);
    })
})

describe("PUT /groups/:id", () => {

    test("Success -> 201 (Created)", async () => {
        const id = "group1"
        const name = "friends";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        const modifiedGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true);
        groups.validateUsers.mockReturnValue(new Promise(resolve => resolve(true)))
        mockManagerFunction(group_data_layer.modifyGroup, new Promise(resolve => resolve(modifiedGroupData)));
        let res = await fetch(`${groupsEndpoint}/groups/${id}`, {
            method: 'put',
            body: JSON.stringify(modifiedGroupData),
            headers: { 'Content-Type': 'application/json' },
        })
        let resJson = await res.json();
        expect(resJson).toEqual(modifiedGroupData);
        expect(res.status).toBe(200);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        const id = "group1"
        const name = "friends";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        const modifiedGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }
        expect.assertions(2);
        groups.validateUsers.mockReturnValue(new Promise(resolve => resolve(true)))
        mockManagerFunction(utils.validateAuth, false)
        let res = await fetch(`${groupsEndpoint}/groups/${id}`, {
            method: 'put',
            body: JSON.stringify(modifiedGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);
    })
    
    test("Failure -> 400 (Bad request, undefined)", async () => {
        const id = "group1"
        const name = "friends";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        let modifiedGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }
        expect.assertions(8);
        utils.validateAuth.mockReturnValue(true);
        for(let property in modifiedGroupData) {
            modifiedGroupData[property] = undefined;
            let res = await fetch(`${groupsEndpoint}/groups/${id}`, {
                method: 'put',
                body: JSON.stringify(modifiedGroupData),
                headers: { 'Content-Type': 'application/json' },
            });
            let resJson = await res.json();
            expect(resJson).toEqual(errors.PARAMS_UNDEFINED);
            expect(res.status).toBe(400);
        }
    })

    test("Failure -> 400 (Bad request, params not array or empty)", async () => {
        const id = "group1"
        const name = "friends";
        const educators = [];
        const collabs = "notAnArray"
        const guys = []

        const modifiedGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${groupsEndpoint}/groups/${id}`, {
            method: 'put',
            body: JSON.stringify(modifiedGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.EMPTY_ARRAY);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, not string)", async () => {
        const id = "group1"
        const name = 123;
        const educators = [567, "Mary"];
        const collabs = ["Patrick", 897]
        const guys = ["Lucas", 111, "Alice"]

        let modifiedGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        let res = await fetch(`${groupsEndpoint}/groups/${id}`, {
            method: 'put',
            body: JSON.stringify(modifiedGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.PARAMS_WRONG_TYPE);
        expect(res.status).toBe(400);
    })

    test("Failure -> 400 (Bad request, not valid users)", async () => {
        const id = "group1"
        const name = "friends";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        let modifiedGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        groups.validateUsers.mockReturnValue(new Promise(resolve => resolve(false)))
        let res = await fetch(`${groupsEndpoint}/groups/${id}`, {
            method: 'put',
            body: JSON.stringify(modifiedGroupData),
            headers: { 'Content-Type': 'application/json' },
        });
        let resJson = await res.json();
        expect(resJson).toEqual(errors.WRONG_USERS);
        expect(res.status).toBe(400);
    })

    test("Failure -> 404 (Bad request, group already present)", async () => {
        const id = "group1"
        const name = "friend";
        const educators = ["John", "Mary"];
        const collabs = ["Patrick", "Violet"]
        const guys = ["Lucas", "Pippo", "Alice"]

        const modifiedGroupData = {
            name: name,
            educators: educators,
            collabs: collabs,
            guys: guys
        }

        expect.assertions(2);
        mockManagerFunction(utils.validateAuth, true);
        groups.validateUsers.mockReturnValue(new Promise(resolve => resolve(true)))
        mockManagerFunction(group_data_layer.modifyGroup, new Promise(resolve => resolve(undefined)));
        let res = await fetch(`${groupsEndpoint}/groups/${id}`, {
            method: 'put',
            body: JSON.stringify(modifiedGroupData),
            headers: { 'Content-Type': 'application/json' },
        })
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
        expect(res.status).toBe(404);
    })
})

describe("DELETE /groups/:id", () => {

    test("Success -> 200 (OK)", async () => {
        expect.assertions(1);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(group_data_layer.deleteGroup, new Promise(resolve => resolve(GROUPS[0])))
        let res = await fetch(`${groupsEndpoint}/groups/first`, { method: 'delete'});
        expect(res.status).toBe(200);
    })

    test("Failure -> 401 (Unauthorized)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(false);
        let res = await fetch(`${groupsEndpoint}/groups/first`, { method: 'delete'});
        let resJson = await res.json();
        expect(resJson).toEqual(errors.ACCESS_NOT_GRANTED);
        expect(res.status).toBe(401);

    })

    test("Failure -> 404 (Not found)", async () => {
        expect.assertions(2);
        utils.validateAuth.mockReturnValue(true);
        mockManagerFunction(group_data_layer.deleteGroup, new Promise(resolve => resolve(undefined)))
        let res = await fetch(`${groupsEndpoint}/groups/third`, { method: 'delete'});
        let resJson = await res.json();
        expect(res.status).toBe(404);
        expect(resJson).toEqual(errors.ENTITY_NOT_FOUND);
    })

})