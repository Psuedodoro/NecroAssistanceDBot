import { BEvent } from "../structures/Event";

export default new BEvent("ready", async () => {
	console.log("🤖 Bot is online and ready!");
});
