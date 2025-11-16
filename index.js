require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

const play = require("play-dl");

(async () => {
    if (await play.is_expired()) {
        await play.refreshToken();
    }

    if (process.env.YT_COOKIE) {
        play.setToken({
            youtube: {
                cookie: process.env.YT_COOKIE
            }
        });
    }

    play.use_ffmpeg = true;
    play.setFfmpegPath("/usr/bin/ffmpeg");
})();

const prefix = ".";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "src/commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

const readyEvent = require("./src/ready.js");
client.once("clientReady", () => readyEvent.run(client));

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();

    const cmd = client.commands.get(cmdName);
    if (!cmd) return;

    try {
        await cmd.run(client, message, args);
    } catch (err) {
        console.error(err);
        message.channel.send("❌ An internal error occurred.");
    }
});

client.login(process.env.TOKEN);
