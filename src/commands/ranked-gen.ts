import RankedGame from "../schemas/RankedGame";
import User from "../schemas/User";

import { Command } from "../structures/Command";
import makeTeams from "../functions/teamsGenerator";

export default new Command({
	name: "generate-ranked",
	description: "Generate a ranked game!",
	options: [
		{
			name: "players",
			description: "Enter all the players that you want to add to the game.",
			type: "STRING",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		if (!interaction.inCachedGuild()) return;

		const interactionUserFromDB = await User.findOne({
			discordID: interaction.user.id,
		});

		const players = interaction.options
			.getString("players")
			.match(/<@!?(\d+)>/g);

		if (!players || players.length < 2) {
			interaction.reply("You need to enter at least 2 players!");
			return;
		}

		if (players.length % 2 !== 0) {
			interaction.reply(
				"You need to enter an even number of players to play a ranked game (this is to calculate ELO and more)."
			);
			return;
		}

		const playerIDs = players.map((player) =>
			player.replace(/<@!?(\d+)>/, "$1")
		);

		//* --- THIS MAKES THE TEAMS - MOST IMPORTANT PART! --- !//
		const makeTeamsDoFinal = async (playersArg) => {
			const gameInfo = makeTeams(playersArg);

			const game = new RankedGame(gameInfo);
			await game.save();

			const { selectedmapimage, selectedmapname, teamA, teamB, gameRef } =
				gameInfo;

			const teamAIDs = teamA.map((player) =>
				player.replace(/<@!?(\d+)>/, "$1")
			);

			const teamBIDs = teamA.map((player) =>
				player.replace(/<@!?(\d+)>/, "$1")
			);

			interaction.channel.send({
				embeds: [
					{
						title: `A **Ranked** Game Has Been Generated On ${selectedmapname}!`,
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
						],
						image: {
							url: `${selectedmapimage}`,
							height: 960,
							width: 540,
						},
					},
				],
			});

			//TODO: Test this VC Moving stuff
			await new Promise((resolve) => setTimeout(resolve, 5000));

			const generalVC = await interaction.guild.channels.cache.find(
				(channel) => channel.id === "962385657794277466"
			);

			if (!generalVC.isVoice()) return;
			if (!generalVC.members || generalVC.members === null) return;

			const privateVC = interaction.guild.channels.cache.find(
				(channel) => channel.id === "962385681148157992"
			);

			const privateVC2 = interaction.guild.channels.cache.find(
				(channel) => channel.id === "962385706158788618"
			);

			if (!privateVC.isVoice()) return;
			if (!privateVC2.isVoice()) return;

			if (!privateVC) {
				interaction.reply(
					"I couldn't find the private channel, please make sure it exists and try again."
				);
			}

			if (!privateVC2) {
				interaction.reply(
					"I couldn't find the private 2 vc channel, please make sure it exists and try again."
				);
			}

			const teamAInGeneral = generalVC.members.filter((user) =>
				teamAIDs.includes(user.id)
			);

			const teamBInGeneral = generalVC.members.filter((user) =>
				teamBIDs.includes(user.id)
			);

			teamAInGeneral.forEach(async (user) => {
				await user.voice.setChannel(privateVC);
			});

			teamBInGeneral.forEach(async (user) => {
				await user.voice.setChannel(privateVC2);
			});

			return;
		};
		//*! --- End of team generation etc stuff --- !//

		//* Suspended Check
		const usersFromDB = await User.find({
			discordID: {
				$in: playerIDs,
			},
		});

		for (let i = 0; i < usersFromDB.length; i++) {
			const user = usersFromDB[i];

			if (
				user.suspended === true &&
				(Math.round(Date.now() / 1000) > user.suspendedUntil ||
					user.suspendedUntil === null)
			) {
				interaction.reply(
					`<@${user.discordID}> is suspended and cannot play ranked games.\nSuspension reason: ${user.suspendedReason}`
				);
				return;
			} else {
				user.suspended = false;
				user.suspendedUntil = null;
				await user.save();
			}
		}

		//* --- Game Starting Conformation Message --- *//
		const message = await interaction.reply({
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
				interaction.channel.send(
					"Not all of the players have confirmed to join the game. Aborting!"
				);
				return;
			}
		});
		//* --- End of Conformation Message --- *//
	},
});
