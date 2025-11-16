const os = require("os");
const { EmbedBuilder } = require("discord.js");

function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let days = Math.floor(seconds / 86400);
    seconds %= 86400;
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    let minutes = Math.floor(seconds / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

module.exports = {
    name: "stats",
    run: async (client, message) => {
        const cpuModel = os.cpus()[0].model;
        const cpuCores = os.cpus().length;
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
        const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);

        const embed = new EmbedBuilder()
            .setColor("#00A6FF")
            .setTitle("aero-1 @ web")
            .setDescription(`
**Aero:** ${usedRam}/${totalRam}GB  
**Node:** ${process.version}  
**Discord.js:** v${require("discord.js").version}  
**CPU:** ${cpuModel} (${cpuCores})  
**RAM:** ${totalRam}GB (${((usedRam / totalRam) * 100).toFixed(2)}%)  
**Uptime:** ${formatTime(client.uptime)}  
`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};