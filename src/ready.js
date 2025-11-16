module.exports = {
    name: "clientReady",
    run: (client) => {
        console.log(`Logged in as ${client.user.tag}`);

        client.user.setPresence({
            activities: [
                { name: "https://aero.app", type: 4 }
            ],
            status: "dnd"
        });
    }
};