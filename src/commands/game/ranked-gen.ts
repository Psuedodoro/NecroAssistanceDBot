import RankedGame from "../../schemas/RankedGame";
import User from "../../schemas/User";
import { BCommand } from "../../structures/Command";
import makeTeams from "../../functions/teamsGenerator";
import awaitTimeout from "../../functions/awaitTimeout";

import Eris, { VoiceChannel } from "eris";

import { DateTime } from "luxon";
import { bot } from "../..";

export default new BCommand({
	name: "generate-ranked",
	description: "Generate a ranked game!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "players",
			description: "Enter all the players that you want to add to the game.",
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			required: true,
		},
		{
			name: "do-agent-banning",
			description: "Do you want to be able to ban agents?",
			type: Eris.Constants.ApplicationCommandOptionTypes.BOOLEAN,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const doBanAgents = interaction.data.options.find(
			(o) => o.name === "do-agent-banning"
		).value as boolean;

		const interactionUserFromDB = await User.findOne({
			discordID: interaction.user.id,
		});

		const _players = interaction.data.options.find(
			(o) => o.name === "do-agent-banning"
		).value as string;
		const players = _players.match(/<@!?(\d+)>/g);

		if (!players || players.length < 2) {
			interaction.createMessage("You need to enter at least 2 players!");
			return;
		}

		if (players.length % 2 !== 0) {
			interaction.createMessage(
				"You need to enter an even number of players to play a ranked game (this is to calculate ELO and more)."
			);
			return;
		}

		const playerIDs = players.map((player) =>
			player.replace(/<@!?(\d+)>/, "$1")
		);

		//* Suspended Check
		const usersFromDB = await User.find({
			discordID: {
				$in: playerIDs,
			},
		});

		//* --- THIS MAKES THE TEAMS - MOST IMPORTANT PART! --- !//
		const makeTeamsDoFinal = async (playersArg) => {
			const gameInfo = makeTeams(playersArg, doBanAgents);

			const game = new RankedGame({
				gameMap: gameInfo.gameMap,
				gameRef: gameInfo.gameRef,
				teamA: gameInfo.teamA,
				teamB: gameInfo.teamB,
			});

			await game.save();

			const { selectedmapimage, gameMap, teamA, teamB, gameRef, bannedAgents } =
				gameInfo;

			const teamAIDs = teamA.map((player) =>
				player.replace(/<@!?(\d+)>/, "$1")
			);

			const teamBIDs = teamB.map((player) =>
				player.replace(/<@!?(\d+)>/, "$1")
			);

			// make it so that banned agents variable is equal to "Nothing" if there are no banned agents
			const bannedAgentsString = bannedAgents.length
				? bannedAgents.join(", ")
				: "No banned agents!";

			if (players.length === 2) {
				usersFromDB.forEach((user) => {
					user.cooldown1v1 = DateTime.now().plus({
						minutes: 60,
					})["ts"];

					user.save();
				});
			}

			interaction.channel.createMessage({
				embeds: [
					{
						title: `A **Ranked** Game Has Been Generated On ${gameMap}!`,
						description: `**This game __will__ affect ELO rating scores.**\nGood luck, and may the best team win!`,
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
								name: `Game ID (To submit scores)`,
								value: `${gameRef}`,
								inline: false,
							},
							{
								name: `Banned Agents:`,
								value: `${bannedAgentsString}`,
								inline: false,
							},
						],
						image: {
							url: `${selectedmapimage}`,
						},
					},
				],
			});

			await awaitTimeout(5000);

			const guild = bot.guilds.get(bot.guildID);

			const generalVC = (await guild.channels.find(
				(channel) => channel.id === "962385657794277466"
			)) as Eris.VoiceChannel;

			const teamAVC = "962385681148157992";
			const teamBVC = "962385706158788618";

			const generalVCMembers = generalVC.voiceMembers;

			const teamAMembers = generalVCMembers.filter((member) =>
				teamAIDs.includes(member.id)
			);

			const teamBMembers = generalVCMembers.filter((member) =>
				teamBIDs.includes(member.id)
			);

			teamAMembers.forEach(async (member) => {
				await member.edit({
					channelID: teamAVC,
				});
			});

			teamBMembers.forEach(async (member) => {
				await member.edit({
					channelID: teamBVC,
				});
			});

			return;
		};
		//* --- End of team generation etc stuff --- !//

		// Suspension check
		usersFromDB.forEach(async (user) => {
			if (
				user.suspended === true &&
				(Math.round(Date.now() / 1000) > user.suspendedUntil ||
					user.suspendedUntil === null)
			) {
				interaction.createMessage(
					`<@${user.discordID}> is suspended and cannot play ranked games.\nSuspension reason: ${user.suspendedReason}`
				);
				return;
			} else {
				user.suspended = false;
				user.suspendedUntil = null;
			}
		});

		if (players.length === 2) {
			for (const user of usersFromDB) {
				if (user.cooldown1v1 && user.cooldown1v1 > Date.now()) {
					await interaction.createMessage(
						`<@${
							user.discordID
						}> is on cooldown and cannot play ranked games.\nCooldown ends in ${Math.round(
							DateTime.fromMillis(user.cooldown1v1)
								.diff(DateTime.now(), "minutes")
								.toObject().minutes
						)} minutes.`
					);

					return;
				}
			}
		}

		//* --- Game Starting Conformation Message --- *//
		const message = await interaction.createMessage({
			content:
				"Press on the check mark below to verify that you want to start and join the game.\n**You have 15 seconds to confirm.**",
			fetchReply: true,
		});

		message.react("✅");

		const filter = (reaction, user) => {
			console.log("Filter has been run!");
			return (
				reaction.emoji.name === "✅" && !user.bot && playerIDs.includes(user.id) //* Only users who have signed up to the game can confirm!
			);
		};

		const collector = message.createReactionCollector({
			filter,
			time: 15000,
		});

		var usersReacted = [];

		//* COLLECTOR LISTENER EVENTS
		collector.on("collect", (reaction, user) => {
			console.log("Reaction collected");
			usersReacted.push(user.id);

			if (usersReacted.length === playerIDs.length) {
				collector.stop();
				makeTeamsDoFinal(players);
			}
		});

		collector.on("dispose", (reaction, user) => {
			if (usersReacted.includes(user.id)) {
				usersReacted.splice(usersReacted.indexOf(user.id), 1);
			}
		});

		collector.on("end", (collected) => {
			console.log(usersReacted);

			if (usersReacted.length !== playerIDs.length) {
				const notReactedUsers = playerIDs
					.filter((id) => !usersReacted.includes(id))
					.map((id) => `<@!${id}>`);

				interaction.channel.send(
					`The following players haven't accepted the game:\n${notReactedUsers.join(
						", "
					)}`
				);
				return;
			}
		});
		//* --- End of Conformation Message --- *//
	},
});
