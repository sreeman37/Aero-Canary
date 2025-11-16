const queue = require("../music/queue");
const play = require("play-dl");
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
                const type = await play.sp_validate(query);

                if (type === "track") {
                    const track = await play.spotify(query);

                    const searchQuery = `${track.name} ${track.artists[0].name}`;
                    const yt = (await ytSearch(searchQuery)).videos[0];

                    if (!yt) 
                        return message.channel.send("No YouTube version found.");

                    url = yt.url;

                } else {
                    return message.channel.send("I only support Spotify **track** URLs.");
                }
            } catch (err) {
                console.log(err);
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

        try {
            await queue.playSong(message.guild.id, { url }, message);
            message.channel.send(`▶️ Added to queue: **${url}**`);
        } catch (err) {
            console.error(err);
            return message.channel.send("❌ Error playing the song.");
        }
    }
};
