import RankedGame from "../../schemas/RankedGame";
import MapsAndInfo from "../../data/mapsandinfo.json";

import { BCommand } from "../../structures/Command";
import Eris from "eris";

export default new BCommand({
	name: "view-past-game",
	description: "View a past ranked game!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "game-id",
			description: "The game reference for the ranked game",
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const enteredGameID = interaction.data.options[0].value as string;

		if (!enteredGameID) {
			interaction.createMessage("Please specify a game ID!");
			return;
		}

		if (enteredGameID.length !== 5) {
			interaction.createMessage("Please specify a **valid** game ID!");
			return;
		}

		const game = await RankedGame.findOne({
			gameRef: enteredGameID,
		});

		if (!game) {
			interaction.createMessage("No game has been found with that ID, please try again :D");
			return;
		}

		const { teamA, teamB, gameMap, gameRef } = game;

		const mapImageURL = MapsAndInfo.find((map) => map.name === gameMap).image;

		interaction.createMessage({
			embeds: [
				{
					title: `Game ${gameRef} on ${gameMap}`,
					description: `This is the found game with the ID you entered.`,
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
						{
							name: "Score Yet Submitted?",
							value: `${game.scoreSubmitted ? "Yes" : "No"}`,
							inline: false,
						},
					],
					image: {
						url: `${mapImageURL}`,
					},
				},
			],
		});
	},
});
