import { Command } from "../structures/Command";

import RankedGame from "../schemas/RankedGame";
import User from "../schemas/User";

export default new Command({
	name: "rollback-game",
	description: "Rolls back everyone's stats to the game before last.",
	options: [
		{
			name: "game-id",
			description: "The ID of the game to rollback.",
			type: "STRING",
			required: true,
		},
	],
	commandPermissions: [
		{
			id: "930744788859359282",
			type: "USER",
			permission: true,
		},
		{
			id: "961380756444307496",
			type: "ROLE",
			permission: false,
		},
	],

	run: async ({ interaction }) => {
		const gameref = interaction.options.getString("game-id");

		const gameExists = await RankedGame.findOne({
			gameRef: gameref,
		});

		if (!gameExists) {
			interaction.reply("Game does not exist!");
			return;
		}

		gameExists.scoreSubmitted = false;

		const rawTeamA: string[] = gameExists.teamA.map((user) =>
			user.replace(/[<>!@]/g, "")
		);

		const rawTeamB: string[] = gameExists.teamB.map((user) =>
			user.replace(/[<>!@]/g, "")
		);

		const teamAusers = await User.find({
			discordID: { $in: rawTeamA },
		});

		const teamBusers = await User.find({
			discordID: { $in: rawTeamB },
		});

		teamAusers.forEach((user) => {
			if (user.gamehistory[user.gamehistory.length - 1] === 0) {
				user.losses--;
				user.gamesPlayed--;

				var usersRatingChange: number = user.ratingChange;

				if (usersRatingChange < 0) {
					usersRatingChange = user.elorating =
						user.elorating + -usersRatingChange;
				} else if (usersRatingChange >= 0) {
					user.elorating = user.elorating - usersRatingChange;
				}
			} else if (user.gamehistory[user.gamehistory.length - 1] === 1) {
				user.wins--;
				user.gamesPlayed--;

				var usersRatingChange: number = user.ratingChange;

				if (usersRatingChange < 0) {
					usersRatingChange = user.elorating =
						user.elorating + -usersRatingChange;
				} else if (usersRatingChange >= 0) {
					user.elorating = user.elorating - usersRatingChange;
				}
			}

			user.gamehistory.pop();
			user.save();
		});

		teamBusers.forEach((user) => {
			if (user.gamehistory[user.gamehistory.length - 1] === 0) {
				user.losses--;
				user.gamesPlayed--;

				var usersRatingChange: number = user.ratingChange;

				if (usersRatingChange < 0) {
					usersRatingChange = user.elorating =
						user.elorating + -usersRatingChange;
				} else if (usersRatingChange >= 0) {
					user.elorating = user.elorating - usersRatingChange;
				}
			} else if (user.gamehistory[user.gamehistory.length - 1] === 1) {
				user.wins--;
				user.gamesPlayed--;

				var usersRatingChange: number = user.ratingChange;

				if (usersRatingChange < 0) {
					usersRatingChange = user.elorating =
						user.elorating + -usersRatingChange;
				} else if (usersRatingChange >= 0) {
					user.elorating = user.elorating - usersRatingChange;
				}
			}

			user.gamehistory.pop();
			user.save();
		});

		//* Affect all new LB positions
		var users = await User.find({});
		users.sort((a, b) => b.elorating - a.elorating);

		users = users.filter((user) => user.gamehistory.length > 0);

		for (let i = 0; i < users.length; i++) {
			const user = users[i];

			user.lbpos = i + 1;

			user.save();
		}

		gameExists.save();

		interaction.reply(
			`Game ${gameref} on ${gameExists.gameMap} has been rolled back and stats have been affected accordingly.`
		);
	},
});
