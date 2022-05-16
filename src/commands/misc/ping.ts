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
	subCommands: [
		{
			name: "pingv2",
			description: "sex v2",
			type: "SUB_COMMAND",
		},
	],

	run: async ({ interaction }) => {
		switch (interaction.options.getSubcommand()) {
			case "sex": {
				await interaction.reply("PING v2!");

				break;
			}

			default: {
				await interaction.reply("No subcommand selected.");

				break;
			}
		}
	},
});
