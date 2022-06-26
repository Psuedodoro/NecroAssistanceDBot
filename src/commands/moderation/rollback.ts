import { BCommand } from "../../structures/Command";

import RankedGame from "../../schemas/RankedGame";
import User from "../../schemas/User";
import eloToRank from "../../functions/eloToRank";

export default new BCommand({
	name: "rollback-game",
	description: "Rolls back everyone's stats to the game before last.",
	type: 1,
	options: [
		{
			name: "game-id",
			description: "The ID of the game to rollback.",
			type: 3,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const gameref = interaction.data.options.find((o) => o.name === "game-id").value as string;

		const gameExists = await RankedGame.findOne({
			gameRef: gameref,
		});

		if (!gameExists) {
			interaction.createMessage("Game does not exist!");
			return;
		}

		gameExists.scoreSubmitted = false;

		// Combine 2 arrays
		const allPlayers: string[] = [...gameExists.teamA, ...gameExists.teamB].map((user) => user.replace(/[<>!@]/g, ""));

		const usersFromDB = await User.find({
			discordID: { $in: allPlayers },
		});

		//* Actually do the rollback stuff
		usersFromDB.forEach((user) => {
			user.gamesPlayed--;
			user.cooldown1v1 = 0;
			user.elorating = user.ratingBefore;

			if (user.gamesPlayed < 0) user.gamesPlayed = 0;

			if (user.gamehistory[user.gamehistory.length - 1] === 0) {
				user.gamehistory.pop();

				if (user.losses <= 0) user.losses = 0;
				else user.losses--;
			} else {
				user.gamehistory.pop();
				if (user.wins <= 0) user.wins = 0;
				else user.wins--;
			}

			if (user.gamehistory.length === 0) {
				user.lbpos = 0;
			}

			user.save();
		});

		//* Affect all new LB positions
		var users = await User.find({});
		users.sort((a, b) => b.elorating - a.elorating);

		users = users.filter((user) => user.gamehistory.length > 0);

		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			user.lbpos = i + 1;
			user.rank = eloToRank(user.elorating);
			user.save();
		}

		gameExists.delete();

		interaction.createMessage(
			`Game ${gameref} on ${gameExists.gameMap} has been rolled back and stats have been affected accordingly.\nThe game has also been deleted from the system.`
		);
	},
});
