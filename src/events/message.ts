import { client } from "..";
import { Event } from "../structures/Event";

export default new Event("message", async (message) => {
	if (/[l|L]+[a|A]+[t|T]+[v|V]+[i|I]+[a|A]+/g.test(message.content)) {
		await message.delete();
		message.channel.send(`Degeneracy deleted <@${message.author.id}>`);
	}
});
