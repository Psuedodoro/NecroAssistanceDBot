import User from "../../schemas/User";
import { BCommand } from "../../structures/Command";
import PastUserStats, { IPastUser } from "../../schemas/PastUserStats";
import Eris from "eris";

export default new BCommand({
	name: "reset-stats",
	description: "Reset everyone's stats!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,

	run: async ({ interaction }) => {
		if (!(interaction.member.user.id === "930744788859359282")) {
			interaction.createMessage("You do not have permission to use this command!");
			return;
		}

		interaction.createMessage({
			content: "Resetting everyone's stats...",
			flags: 64,
		});

		var users = await User.find({});
		users.sort((a, b) => b.elorating - a.elorating);

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

		interaction.channel.createMessage({
			embeds: [
				{
					title: `Previous Ranked Game Leaderboard`,
					description: `Team Necro's leaderboard private ranked standings up until ${
						new Date().toLocaleString().split(",")[0]
					}!`,
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

		users.forEach(async (user) => {
			await new PastUserStats({
				discordID: user.discordID,
				elorating: user.elorating,
				wins: user.wins,
				losses: user.losses,
				gamehistory: user.gamehistory,
				gamesPlayed: user.gamesPlayed,
				lbpos: user.lbpos,
				ratingBefore: user.ratingBefore,
				suspended: user.suspended,
				suspendedUntil: user.suspendedUntil,
				suspendedReason: user.suspendedReason,
				suspensionUnit: user.suspensionUnit,
				agents: user.agents,
				rank: user.rank,
			}).save();
		});

		users.forEach(async (user) => {
			user.elorating = 1500;
			user.wins = 0;
			user.losses = 0;
			user.gamesPlayed = 0;
			user.lbpos = 0;
			user.ratingBefore = 0;
			user.rank = "Unranked";
			user.gamehistory = [];

			await user.save();
		});

		(await interaction.user.getDMChannel()).createMessage({
			content: "Reset operation complete.",
		});
	},
});
