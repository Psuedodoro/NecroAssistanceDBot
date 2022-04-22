import mapsAndInfo from "../mapsandinfo.json";
import { Command } from "../structures/Command";
import stdCommandVerification from "../security/commandRunVerification";

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

		var teamA = [];
		var teamB = [];

		results.sort(() => Math.random() - 0.5);

		for (var i = 0; i < results.length; i++) {
			if (i % 2 == 0) {
				teamA.push(results[i]);
			} else {
				teamB.push(results[i]);
			}
		}

		const randBool = Math.random() >= 0.5;

		const isEvenGame = results.length % 2 == 0;

		if (!isEvenGame) {
			if (randBool) {
				teamB.push(teamA.pop());
			}
		}

		const selectedMap =
			mapsAndInfo[Math.floor(Math.random() * mapsAndInfo.length)];

		const selectedmapname = selectedMap.name;
		const selectedmapimage = selectedMap.image;

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
