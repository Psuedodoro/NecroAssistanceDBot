import User from "../../schemas/User";
import Eris, { Embed } from "eris";
import { BCommand } from "../../structures/Command";

export default new BCommand({
	name: "leaderboard-ranked",
	description: "Get all the players from best elo to worst from Ranked Games",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,

	run: async ({ interaction }) => {
		var users = await User.find()
			.where("suspended")
			.ne(true)
			.select("discordID elorating lbpos gamehistory")
			.sort("-elorating");

		users = users.filter((user) => user.gamehistory.length > 0);
		users.sort((a, b) => b.elorating - a.elorating);

		var playernames = [];
		var elorating = [];
		var position = [];

		console.log(users);

		for (let i = 0; i < users.length; i++) {
			const user = users[i];

			const userID = user.discordID;
			const userMention = `<@${userID}>`;

			playernames.push(userMention);
			elorating.push(user.elorating);
			position.push(`#${i + 1}`);
		}

		let chosenEmbed: Embed;

		if (users.length > 0)
			chosenEmbed = {
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
			};
		else
			chosenEmbed = {
				type: "rich",
				title: "No Leader-Board Data Found!",
				description:
					"There are currently no people with any games played to show on the leader-board.\nMaybe play some games first?",
				color: 0xfc0303,
			};

		interaction.createMessage({
			embeds: [chosenEmbed],
		});
	},
});
