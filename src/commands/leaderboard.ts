import User from "../schemas/User";

import { Command } from "../structures/Command";

export default new Command({
	name: "leaderboard-ranked",
	description: "Get all the players from best elo to worst from Ranked Games",

	run: async ({ interaction }) => {
		var users = await User.find({});
		users.sort((a, b) => b.elorating - a.elorating);

		// Only show users that have actually played a ranked game.
		users = users.filter((user) => user.gamehistory.length > 0);

		var playernames = [];
		var elorating = [];
		var position = [];

		for (let i = 0; i < users.length; i++) {
			const user = users[i];

			const userID = user.discordID;
			const userMention = `<@${userID}>`;

			playernames.push(userMention);
			elorating.push(user.elorating);
			position.push(`#${i + 1}`);
		}

		interaction.reply({
			embeds: [
				{
					type: "rich",
					title: `Ranked Game Leaderboard`,
					description: `Team Necro's current leaderboard standings for private ranked games!`,
					color: 0xefb859,
					fields: [
						{
							name: `Player`,
							value: `${playernames.join("\n")}`,
							inline: true,
						},
						{
							name: `ELO`,
							value: `${elorating.join("\n")}`,
							inline: true,
						},
						{
							name: `Position`,
							value: `${position.join("\n")}`,
							inline: true,
						},
					],
				},
			],
		});
	},
});
