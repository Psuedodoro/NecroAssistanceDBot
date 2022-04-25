import { Command } from "../structures/Command";

import RankedGame from "../schemas/RankedGame";

export default new Command({
	name: "abandon-game",
	description: "Abandon a game due to regulations",
	options: [
		{
			name: "game-id",
			description: "The ID of the game to abandon/cancel",
			type: "STRING",
			required: true,
		},
	],

	/* 
	1. Get the game from the GameID
	2. Make sure everyone confirms they want to abandon the game
	3. Send a message to the channel that the game is being abandoned
	4. Delete the RankedGame from the database
	*/

	run: async ({ interaction }) => {
		//* Message conf type guard
		if (!interaction.inCachedGuild()) return;

		const gameRefOption = interaction.options.getString("game-id");

		const gameExists = await RankedGame.findOne({ gameID: gameRefOption });

		if (!gameExists) {
			interaction.reply("That game doesn't exist! Please try again.");
			return;
		}

		if (gameRefOption.length !== 5) {
			interaction.reply("Please enter a valid game ID (5 chars long)!");
			return;
		}

		const actuallyAbandonMethod = () => {
			gameExists.remove();
			interaction.reply(
				`The game on ${gameExists.gameMap} with the ID ${gameExists.gameRef} has been abandoned!`
			);
		};

		//* --- Abandon Conformation Message Stuff --- *//
		const allGamePlayerMentions = [...gameExists.teamA, ...gameExists.teamB];

		const allGamePlayerIDs = allGamePlayerMentions.map((player) =>
			player.replace(/<@!?(\d+)>/, "$1")
		);

		const reactedIDs = [];

		const message = await interaction.reply({
			content: `Can the following people please confirm that they want to abandon the game:\n${allGamePlayerMentions.join(
				", "
			)}\n**You have 15 seconds to confirm abandonment of the game.**`,
			fetchReply: true,
		});

		message.react("✅");

		const filter = (reaction, user) => {
			console.log("Filter has been run!");
			return (
				reaction.emoji.name === "✅" &&
				!user.bot &&
				allGamePlayerIDs.includes(user.id) //* Only users who have signed up to the game can confirm!
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

			if (usersReacted.length === allGamePlayerIDs.length) {
				collector.stop();
				//* makeTeamsDoFinal(players);
			}
		});

		collector.on("dispose", (reaction, user) => {
			if (usersReacted.includes(user.id)) {
				usersReacted.splice(usersReacted.indexOf(user.id), 1);
			}
		});

		collector.on("end", (collected) => {
			console.log(usersReacted);

			if (usersReacted.length !== allGamePlayerIDs.length) {
				interaction.channel.send(
					"Not all of the players have confirmed to join the game. Aborting!"
				);
				return;
			}
		});
		//* --- End of Conformation Message --- *//
	},
});
