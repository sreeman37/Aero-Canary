const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    getVoiceConnection
} = require("@discordjs/voice");

const play = require("play-dl");

class MusicQueue {
    constructor() {
        this.queue = new Map();
    }

    createConnection(message) {
        const guildId = message.guild.id;

        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: guildId,
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

        this.queue.set(guildId, {
            connection,
            player,
            songs: [],
            playing: false
        });
    }

    async playSong(guildId, song, message) {
        const guildQueue = this.queue.get(guildId);
        if (!guildQueue) return message.channel.send("Queue not ready.");

        guildQueue.songs.push(song);

        if (!guildQueue.playing) {
            guildQueue.playing = true;
            this._playNext(guildId, message);
        }
    }

    async _playNext(guildId, message) {
        const guildQueue = this.queue.get(guildId);
        const next = guildQueue.songs[0];

        if (!next) {
            guildQueue.playing = false;
            return message.channel.send("Queue finished.");
        }

        try {
            const stream = await play.stream(next.url);

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });

            guildQueue.player.play(resource);

            message.channel.send(`🎶 Now playing: **${next.url}**`);

            guildQueue.player.once(AudioPlayerStatus.Idle, () => {
                guildQueue.songs.shift(); // remove finished
                this._playNext(guildId, message);
            });

            guildQueue.player.on("error", (err) => {
                console.error(err);
                message.channel.send("❌ Error playing the song.");
                guildQueue.songs.shift();
                this._playNext(guildId, message);
            });

        } catch (err) {
            console.error(err);
            message.channel.send("❌ Error playing the song.");
            guildQueue.songs.shift();
            this._playNext(guildId, message);
        }
    }

    pause(guildId) {
        const q = this.queue.get(guildId);
        if (!q) return false;
        q.player.pause();
        return true;
    }

    resume(guildId) {
        const q = this.queue.get(guildId);
        if (!q) return false;
        q.player.unpause();
        return true;
    }

    stop(guildId) {
        const q = this.queue.get(guildId);
        if (!q) return false;

        q.songs = [];
        q.player.stop();

        const conn = getVoiceConnection(guildId);
        if (conn) conn.destroy();

        this.queue.delete(guildId);

        return true;
    }
}

module.exports = new MusicQueue();
