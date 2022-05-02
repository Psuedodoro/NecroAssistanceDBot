import RankedGame from "../../schemas/RankedGame";
import MapsAndInfo from "../../data/mapsandinfo.json";

import { Command } from "../../structures/Command";

export default new Command({
	name: "view-past-game",
	description: "View a past ranked game!",
	options: [
		{
			name: "game-id",
			description: "The game reference for the ranked game",
			type: "STRING",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const enteredGameID = interaction.options.getString("game-id");

		if (!enteredGameID) {
			interaction.reply("Please specify a game ID.!");
			return;
		}

		if (enteredGameID.length !== 5) {
			interaction.reply("Please specify a valid game ID.!");
			return;
		}

		const game = await RankedGame.findOne({
			enteredGameID,
		});

		if (!game) {
			interaction.reply(
				"No game has been found with that ID, please try again :D"
			);
			return;
		}

		const { teamA, teamB, gameMap, gameRef } = game;

		const mapImageURL = MapsAndInfo.find((map) => map.name === gameMap).image;

		interaction.reply({
			embeds: [
				{
					type: "rich",
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
						height: 960,
						width: 540,
					},
				},
			],
		});
	},
});
