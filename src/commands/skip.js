const queue = require("../music/queue");

module.exports = {
    name: "skip",
    run: async (client, message) => {
        const serverQueue = queue.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send("No music playing!");

        serverQueue.player.stop();
        message.channel.send("Skipped!");
    }
};