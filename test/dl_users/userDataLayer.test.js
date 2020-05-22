const fetch = require("node-fetch");
const URL = "http://localhost:3335/data/users";
let mockUsers = require("../data/users.js");
//mockUsers = JSON.parse(JSON.stringify(mockUsers));

//console.log("MOCKINO: "+ mockUsers);

process.env.TEST = true;
process.env.MOCK_USERS = JSON.stringify(mockUsers);
const app = require("../../data_layer/user_data_layer/userDataLayer");

beforeAll(async () => {
    await app.server_starting;
    await app.inmemory_mongodb_promise;
});

afterAll(() => {
    console.log("In chiusura");
    app.server.close();
});

describe("Get all users", () => {
    test("Retrieve all user", () => {
        let options = {
            method: 'GET'
        }

        return fetch(URL, options).then(
            res => {
                res.json().then(body => {
                    console.log("UTENTI = " + body);
                    expect(res.status).toBe(200);
                })
            }
        )
    });
});