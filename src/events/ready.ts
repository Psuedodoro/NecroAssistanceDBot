import { ApplicationCommandPermissionData } from "discord.js";
import { client } from "..";
import { Event } from "../structures/Event";

export default new Event("ready", async () => {
	console.log("🤖 Bot is online");

	if (!client.application?.owner) await client.application?.fetch();

	const command = await client.guilds.cache
		.get("961380756444307496")
		?.commands.fetch("965301545036029954");

	const permissions: ApplicationCommandPermissionData[] = [
		{
			id: "930744788859359282",
			type: "USER",
			permission: true,
		},
		{
			id: "961380756444307496",
			type: "ROLE",
			permission: false,
		},
	];

	command.permissions.set({ permissions });

	console.log("🚨 Permissions updated for submit commands");
});
