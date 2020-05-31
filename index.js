const gc = require("./googleCalendarUtils");

async function test(){

    const event = {
        group: "mjiraihs",
        title: "Riunione", 
        from: "2020-06-01T13:00:00", 
        to: "2020-06-01T14:00:00"
    };

    await gc.init();

    let result = await gc.addEvent(event);

    console.log("CREATED -> " + JSON.stringify(result) + "\n\n");

    event.title = "Riunione modded";
    result = await gc.modifyEvent(result.calendarId, result.eventId, event);

    console.log("MODDED -> " + JSON.stringify(result));
}

test();