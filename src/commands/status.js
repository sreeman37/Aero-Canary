const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "status",
    run: async (client, message) => {
        const embed = new EmbedBuilder()
            .setColor("#bff5d1")
            .setTitle("All Systems Operational")
            .setDescription(`✔ API: operational  
✔ Media Proxy: operational  
✔ Gateway: operational  
✔ Push Notifications: operational  
✔ Search: operational  
✔ Voice: operational  
✔ Client: operational  
✔ Third-party: operational  
✔ Server Web Pages: operational  
✔ Payments: operational  
✔ Marketing Site: operational  

**Latest Incident**  
Issues connecting to Voice (resolved)
`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};