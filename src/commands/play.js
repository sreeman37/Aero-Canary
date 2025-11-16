const queue = require("../music/queue");
const { getPreview } = require("spotify-url-info")(globalThis.fetch);
const ytSearch = require("yt-search");

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
                const preview = await getPreview(query);

                if (!preview || !preview.title || !preview.artist)
                    return message.channel.send("Could not read Spotify info.");

                const searchTerm = `${preview.title} ${preview.artist}`;
                const yt = (await ytSearch(searchTerm)).videos[0];

                if (!yt)
                    return message.channel.send("No YouTube version found.");

                url = yt.url;
                query = `${preview.title} – ${preview.artist}`;

            } catch (err) {
                console.error("Spotify error:", err);
                return message.channel.send("Could not process Spotify link.");
            }
        }

        else if (query.includes("youtube.com") || query.includes("youtu.be")) {
            url = query;
        }

        else {
            const yt = (await ytSearch(query)).videos[0];
            if (!yt)
                return message.channel.send("No results found!");

            url = yt.url;
        }

        await queue.playSong(message.guild.id, { url, title: query }, message);

        message.channel.send(`Added to queue: **${query}**`);
    }
};
