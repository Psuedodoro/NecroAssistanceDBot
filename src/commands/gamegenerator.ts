import { Command } from "../structures/Command";
import makeTeams from "../functions/teamsGenerator";

export default new Command({
	name: "generate-game",
	description: "Generate the game!",
	options: [
		{
			name: "players",
			description: "Enter all the players that you want to add to the game.",
			type: "STRING",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const results = interaction.options
			.getString("players")
			.match(/<@!?(\d+)>/g);

		if (!results || results.length < 2) {
			interaction.reply("You need to enter at least 2 players!");
			return;
		}

		const { teamA, teamB, selectedmapimage, selectedmapname } =
			makeTeams(results);

		interaction.reply({
			embeds: [
				{
					type: "rich",
					title: `A Game Has Been Generated On ${selectedmapname}!`,
					description: `Good luck, and may the best team win!`,
					color: 0x09ff00,
					fields: [
						{
							name: `Team A (T → CT):`,
							value: `${teamA.join("\n")}`,
							inline: true,
						},
						{
							name: `Team B (CT → T):`,
							value: `${teamB.join("\n")}`,
							inline: true,
						},
					],
					image: {
						url: `${selectedmapimage}`,
						height: 960,
						width: 540,
					},
				},
			],
		});
	},
});
