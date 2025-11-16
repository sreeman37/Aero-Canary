module.exports = {
    name: "ping",
    run: async (client, message) => {
        const msg = await message.channel.send("Pinging...");
        msg.edit(`Latency: **${msg.createdTimestamp - message.createdTimestamp}ms**`);
    }
};