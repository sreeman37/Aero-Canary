const { inspect } = require("util");

module.exports = {
  name: "ev",
  run: async (client, message, args) => {
    if (!args.length) return message.channel.send("Provide code to evaluate.");

    const code = args.join(" ");
    const start = process.hrtime.bigint();
    let result;

    try {
      const fn = new Function(
        "client",
        "message",
        "self",
        `
          try {
            return (async () => { return ${code} })();
          } catch (e) {
            return e;
          }
        `
      );
      result = await fn(client, message, client);
    } catch (err) {
      result = err;
    }

    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;

    const type =
      result instanceof Error
        ? "Error"
        : typeof result === "function"
        ? `Function(${result.length}-arity)`
        : result?.constructor?.name || typeof result;

    let output =
      typeof result === "string"
        ? result
        : inspect(result, { depth: 1 }).replaceAll("`", "`\u200b");

    const header = `Output:\n`;
    const typeBlock = `\nType:\n\`\`\`\n${type}\n\`\`\`\n\n⏱ ${ms.toFixed(2)}ms`;

    const full = header + "```" + output + "```" + typeBlock;

    if (full.length <= 2000) {
      return message.channel.send(full);
    }

    await message.channel.send("Output was too long. Splitting into chunks…");

    const chunks = [];
    const limit = 1900;

    for (let i = 0; i < output.length; i += limit) {
      chunks.push(output.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await message.channel.send("```" + chunk + "```");
    }

    await message.channel.send(typeBlock);
  },
};
