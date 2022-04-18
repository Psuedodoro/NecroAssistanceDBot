import { Command } from "../structures/Command";

export default new Command({
	name: "test",
	description: "tester",
	options: [
		{
			name: "info",
			description: "test the bot ig lmao",
			type: "STRING",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		await interaction.reply("Hello");
	},
});
