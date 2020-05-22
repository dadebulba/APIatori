const mockUsers = require("../data/users.js");

process.env.TEST = true;
process.env.MOCK_USERS = JSON.stringify(mockUsers);
const userDL = require("../../data_layer/user_data_layer/userDataLayer");

//Data layer APIs
const getAllUsers = userDL.getAllUsers;
const getUser = userDL.getUser;
const createUser = userDL.createUser;

beforeAll(async () => {
    await userDL.inmemory_mongodb_promise;

    //Retrive id of the inserted mocked data
    let data = await getAllUsers();
    if (data == undefined)
        process.exit(1);

    for (var i=0; i<mockUsers.length; i++)
        mockUsers[i].uid = data[i].uid;
});

describe("Get all users", () => {
    test("01 - Retrieve all users - should return a list", () => {
        getAllUsers().then(data => {
            expect(data).not.toBeNull();
            expect(data.length).toBe(mockUsers.length);
        })
    });
});

describe("Get user by id", () => {
    test("01 - uid not specified - should throw", async () => {
        await expect(getUser()).rejects.toThrow(Error);
    });

    test("02 - uid undefined - should throw", async () => {
        const uid = undefined;

        await expect(getUser(uid)).rejects.toThrow(Error);
    });

    test("03 - uid is an array - should throw", async () => {
        const uid = [];

        await expect(getUser(uid)).rejects.toThrow(Error);
    });

    test("04 - uid not exists - should return null", async () => {
        const uid = mockUsers[0].uid.substring(0, mockUsers[0].uid.length-5) + "abcde";
        const res = await getUser(uid);

        expect(res).toBeUndefined();
    });

    test("05 - uid valid - should return the user", async () => {
        const uid = mockUsers[0].uid;
        const res = await getUser(uid);

        expect(res).not.toBeUndefined();
    });
});

describe("Create a new user", () => {
    test("01 - User info not specified - should throw", async () => {
        await expect(createUser()).rejects.toThrow(Error);
    });

    test("02 - User info undefined - should throw", async () => {
        let userInfo = undefined;
        await expect(createUser(userInfo)).rejects.toThrow(Error);
    });

    test("03 - User info is not an object - should throw", async () => {
        let userInfo = [];
        await expect(createUser(userInfo)).rejects.toThrow(Error);
    });

    test("04 - User info contains not well-formed fields (birthdate) - should throw", async () => {
        let userInfo = {
            name: "User",
            surname: "From_tests",
            birthdate: "not_a_date",
            mail: "name.surname@mail.com",
            password: "testPassword"
        };

        await expect(createUser(userInfo)).rejects.toThrow(Error);
    });

    test("05 - User info contains not well-formed fields (mail) - should throw", async () => {
        let userInfo = {
            name: "User",
            surname: "From_tests",
            birthdate: "1990-01-01",
            mail: "name.surname@mail",
            password: "testPassword"
        };

        await expect(createUser(userInfo)).rejects.toThrow(Error);
    });

    test("06 - User info contains not well-formed fields (parents mail) - should throw", async () => {
        let userInfo = {
            name: "User",
            surname: "From_tests",
            birthdate: "1990-01-01",
            mail: "name.surname@mail.com",
            password: "testPassword",
            parents: [
                {name: "p1name", surname: "p1surname", mail: "p1n.p2s@mail"}
            ]
        };

        await expect(createUser(userInfo)).rejects.toThrow(Error);
    });

    test("07 - Valid user data - should return the new user", async () => {
        let userInfo = {
            name: "User",
            surname: "From_tests",
            birthdate: "1990-01-01",
            mail: "name.surname@mail.com",
            password: "testPassword"
        };

        const res = await createUser(userInfo);
        expect(res).not.toBeUndefined();
    });
});