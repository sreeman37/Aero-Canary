module.exports = {
    name: "clientReady",
    run: (client) => {
        console.log(`Connected as: ${client.user.tag}`);

        client.user.setPresence({
            activities: [
                { name: "fred.camp", type: 3 }
            ],
            status: "online"
        });
    }
};
