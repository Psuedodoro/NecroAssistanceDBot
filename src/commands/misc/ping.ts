import { Command } from "../../structures/Command";

export default new Command({
	name: "ping",
	description: "replies with pong",
	options: [
		{
			name: "user",
			description: "user to ping",
			type: "USER",
		},
	],

	run: async ({ interaction }) => {
		interaction.reply("Pong!");
	},
});
