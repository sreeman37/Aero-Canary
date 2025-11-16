const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

class MusicQueue {
    constructor() {
        this.queue = new Map();
    }

    async playSong(guildId, song, interaction) {
        const serverQueue = this.queue.get(guildId);
        serverQueue.songs.push(song);

        if (!serverQueue.playing) {
            serverQueue.playing = true;
            this.play(guildId, interaction);
        }
    }

    async play(guildId, message) {
        const serverQueue = this.queue.get(guildId);
        const song = serverQueue.songs[0];

        if (!song) {
            serverQueue.playing = false;
            return;
        }

        const stream = ytdl(song.url, { filter: "audioonly", quality: "highestaudio" });

        const resource = createAudioResource(stream);
        serverQueue.player.play(resource);

        serverQueue.player.once(AudioPlayerStatus.Idle, () => {
            serverQueue.songs.shift();
            this.play(guildId, message);
        });
    }

    createConnection(message) {
        const channel = message.member.voice.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        this.queue.set(message.guild.id, {
            connection,
            player,
            songs: [],
            playing: false
        });
    }
}

module.exports = new MusicQueue();