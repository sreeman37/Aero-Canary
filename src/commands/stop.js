const queue = require("../music/queue");

module.exports = {
    name: "stop",
    run: async (client, message) => {
        const serverQueue = queue.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send("No music playing!");

        serverQueue.songs = [];
        serverQueue.player.stop();

        message.channel.send("Stopped and cleared queue.");
    }
};