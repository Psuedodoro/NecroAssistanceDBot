import { ApplicationCommandPermissionData } from "discord.js";
import { client } from "..";
import { Event } from "../structures/Event";

export default new Event("ready", async () => {
	console.log("🤖 Bot is online");

	if (!client.application?.owner) await client.application?.fetch();
});
