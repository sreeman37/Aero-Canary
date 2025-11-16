const queue = require("../music/queue");
const { getPreview } = require("spotify-url-info");

module.exports = {
    name: "play",
    run: async (client, message, args) => {
        if (!message.member.voice.channel)
            return message.channel.send("Join a voice channel first!");

        if (!args.length) return message.channel.send("Provide a song name or link!");

        let query = args.join(" ");
        let url = null;

        if (!queue.queue.has(message.guild.id)) queue.createConnection(message);

        if (query.includes("spotify.com")) {
            try {
                const data = await getPreview(query);
                const searchQuery = `${data.title} ${data.artist}`;
                const yt = (await require("yt-search")(searchQuery)).videos[0];
                url = yt.url;
            } catch {
                return message.channel.send("Could not process Spotify link.");
            }
        }
    }
};