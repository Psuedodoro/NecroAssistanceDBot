// TODO: Fix Images
import { BCommand } from "../../structures/Command";
import makeTeams from "../../functions/teamsGenerator";
import Eris from "eris";

export default new BCommand({
	name: "generate-game",
	description: "Generate the game!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "players",
			description: "Enter all the players that you want to add to the game.",
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const results = (interaction.data.options[0].value as string).match(/<@!?\d{18}>/g);

		if (!results || results.length < 2) {
			interaction.createMessage("You need to enter at least 2 players!");
			return;
		}

		const { teamA, teamB, selectedmapimage, gameMap } = makeTeams(results, false);

		interaction.createMessage({
			embeds: [
				{
					title: `A Game Has Been Generated On ${gameMap}!`,
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
					},
				},
			],
		});
	},
});
