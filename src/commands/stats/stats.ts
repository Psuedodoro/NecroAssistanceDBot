import { bot } from "../..";
import User from "../../schemas/User";
import Eris from "eris";

import { BCommand } from "../../structures/Command";

export default new BCommand({
	name: "stats",
	description: "Find the stats for any player",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "user",
			description: "The user to find the stats for",
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			required: false,
		},
	],

	run: async ({ interaction }) => {
		// TODO: Fix this

		const user: Eris.User = interaction.data.options
			? interaction.data.resolved.users.values().next().value
			: interaction.member.user;

		const userExists = await User.findOne({
			discordID: user.id,
		});

		if (!userExists) {
			interaction.createMessage(
				"User has not registered!\nUse /register now to play ranked games!"
			);

			return;
		}

		const interactionUser = await User.findOne({
			discordID: user.id,
		});

		if (userExists.suspended === true) {
			interaction.createMessage(
				`${user.username} has been suspended from Ranked Games and is currently voided from the leaderboard and ranked play.\nSuspension reason: ${userExists.suspendedReason}`
			);
			return;
		}

		if (interactionUser.suspended === true) {
			const interactionUsername = bot.users.get(interactionUser.discordID);

			interaction.createMessage({
				content: `${interactionUsername} has been suspended from Ranked Games and cannot use this command.\nSuspension reason: ${interactionUser.suspendedReason}`,
				flags: 64,
			});
			return;
		}

		if (!userExists) {
			interaction.createMessage(
				"You are not registered! Please use the **/register** slash command to get started!"
			);
			return;
		} else {
			const userPfp = user.staticAvatarURL;

			let past10games;
			var formattedHistory: string[] | string = [];

			if (userExists.gamehistory.length === 0) {
				past10games = "No past games.";
			} else {
				past10games = userExists.gamehistory.slice(
					-10,
					userExists.gamehistory.length
				);

				for (let i = 0; i < past10games.length; i++) {
					if (past10games[i] === 1) {
						past10games[i] = "<:win:964287115024281691>";
					} else {
						past10games[i] = "<:loss:964287148989771826>";
					}
				}
			}

			if (past10games === "No past games.") {
				formattedHistory = past10games;
			} else {
				formattedHistory = String(past10games.join(" "));
			}

			var lbpos: string | number = userExists.lbpos;

			if (lbpos === 0) {
				lbpos = "?";
			}

			var rank = userExists.rank;

			if (past10games === "No past games.") {
				rank = "Unranked";
			}

			interaction.createMessage({
				embeds: [
					{
						title: `${user.username} [${lbpos}]`,
						description: `${rank}\nGames Played - ${userExists.gamesPlayed}`,
						color: 0x3498db,
						fields: [
							{
								name: `Elo Rating`,
								value: `${userExists.elorating}`,
								inline: true,
							},
							{
								name: `**Win %**`,
								value: `${(
									(userExists.wins / userExists.gamesPlayed) *
									100
								).toFixed(1)}%`,
								inline: true,
							},
							{
								name: `Wins`,
								value: `${userExists.wins}`,
								inline: true,
							},
							{
								name: `Losses`,
								value: `${userExists.losses}`,
								inline: true,
							},
							{
								name: `Past 10 Games`,
								value: `${formattedHistory}`,
							},
						],
						thumbnail: {
							url: `${userPfp}`,
						},
					},
				],
			});
		}
	},
});
