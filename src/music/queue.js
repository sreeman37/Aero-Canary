const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    getVoiceConnection
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg-static");

class MusicQueue {
    constructor() {
        this.queue = new Map();
    }

    createConnection(message) {
        const channel = message.member.voice.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
});

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        });

        connection.subscribe(player);

        this.queue.set(message.guild.id, {
            connection,
            player,
            songs: [],
            playing: false
        });
    }

    async playSong(guildId, song, message) {
        const serverQueue = this.queue.get(guildId);

        serverQueue.songs.push(song);

        if (serverQueue.playing) return;

        this.processQueue(guildId, message);
    }

    async processQueue(guildId, message) {
        const serverQueue = this.queue.get(guildId);
        const song = serverQueue.songs[0];

        if (!song) {
            serverQueue.playing = false;
            return;
        }

        serverQueue.playing = true;

        try {
            const stream = ytdl(song.url, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream);

            serverQueue.player.play(resource);

            message.channel.send(`🎵 Now playing: **${song.url}**`);

            serverQueue.player.once(AudioPlayerStatus.Idle, () => {
                serverQueue.songs.shift();
                this.processQueue(guildId, message);
            });

        } catch (err) {
            console.log("Playback error:", err);
            message.channel.send("⚠ Error playing the song.");
            serverQueue.songs.shift();
            this.processQueue(guildId, message);
        }
    }
}

module.exports = new MusicQueue();
