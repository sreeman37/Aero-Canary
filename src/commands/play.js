const queue = require("../music/queue");
const { getPreview } = require("spotify-url-info")(globalThis.fetch);
const ytSearch = require("yt-search");
require("ffmpeg-static");

module.exports = {
    name: "play",
    run: async (client, message, args) => {
        if (!message.member.voice.channel)
            return message.channel.send("Join a voice channel first!");

        if (!args.length)
            return message.channel.send("Provide a song name or link!");

        let query = args.join(" ");
        let url = null;

        if (!queue.queue.has(message.guild.id))
            queue.createConnection(message);

        if (query.includes("spotify.com")) {
            try {
                const data = await getPreview(query);

                if (!data || !data.title)
                    return message.channel.send("Spotify link could not be read.");

                const searchQuery = `${data.title} ${data.artist}`;
                const yt = (await ytSearch(searchQuery)).videos[0];

                if (!yt)
                    return message.channel.send("No matching YouTube version found.");

                url = yt.url;

            } catch (err) {
                console.error("Spotify Error:", err);
                return message.channel.send("Could not process Spotify link.");
            }
        }

        else if (query.includes("youtube.com") || query.includes("youtu.be")) {
            url = query;
        }

        else {
            const yt = (await ytSearch(query)).videos[0];
            if (!yt)
                return message.channel.send("No search results found!");
            url = yt.url;
        }

        await queue.playSong(message.guild.id, { url }, message);

        message.channel.send(`Added to queue: **${url}**`);
    }
};
