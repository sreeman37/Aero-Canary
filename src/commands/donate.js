const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "donate",
    run: async (client, message) => {
        const embed = new EmbedBuilder()
            .setColor("#5a6ea3")
            .setTitle("Support Aero")
            .setDescription("If you'd like to help keep the bot online, consider [donating](https://your-link.com)!");

        message.channel.send({ embeds: [embed] });
    }
};
