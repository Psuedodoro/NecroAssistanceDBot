import { Command } from "../structures/Command";

import EloRank from "elo-rank";
const elo = new EloRank(25);

import RankedGame from "../schemas/RankedGame";
import User from "../schemas/User";

export default new Command({
	name: "submit-score",
	description: "Submit the score for a ranked game!",
	options: [
		{
			name: "game-id",
			description: "The game reference for the ranked game",
			type: "STRING",
			required: true,
		},
		{
			name: "winning-team",
			description: "Which team won?",
			type: "STRING",
			required: true,
			choices: [
				{
					name: "Team A",
					value: "team-a",
				},
				{
					name: "Team B",
					value: "team-b",
				},
			],
		},
	],

	run: async ({ interaction }) => {
		/* Bonus rules are as follows:
			3 wins: 5
			4 winstreak: 6
			5 winstreak: 7
			6 winstreak: 8
			7 winstreak: 8 
		*/

		// TODO: Add a conformation prompt to this like the ranked game creation thing.
		const gameID = interaction.options.getString("game-id");
		const winningTeam = interaction.options.getString("winning-team");

		console.log(winningTeam, gameID); // team-a ug2ro

		if (gameID.length !== 5) {
			interaction.reply("The game ID must be 5 characters long!");
			return;
		}

		const selectedGame = await RankedGame.findOne({
			gameRef: gameID,
		});

		if (!selectedGame) {
			interaction.reply("There is no such game with that ID.");
			return;
		}

		if (selectedGame.scoreSubmitted) {
			interaction.reply(
				"This game has already been submitted and cannot be re-submitted/altered without appropriate permissions."
			);
			return;
		}

		//* Team user stuff
		const teamA = selectedGame.teamA.map((player) =>
			player.replace(/[<@!>]/g, "")
		);

		var teamAUsers = await User.find({
			discordID: {
				$in: teamA,
			},
		});

		const teamB = selectedGame.teamB.map((player) =>
			player.replace(/[<@!>]/g, "")
		);

		var teamBUsers = await User.find({
			discordID: {
				$in: teamB,
			},
		});

		//* Sorting to be balanced
		teamAUsers.sort((a, b) => a.elorating - b.elorating);
		teamBUsers.sort((a, b) => a.elorating - b.elorating);

		//* Actual code to change scores etc
		for (let i = 0; i < teamAUsers.length; i++) {
			const userA = teamAUsers[i];
			const userB = teamBUsers[i];

			userA.gamesPlayed++;
			userB.gamesPlayed++;

			userA.ratingBefore = userA.elorating;
			userB.ratingBefore = userB.elorating;

			if (winningTeam === "team-a") {
				userA.wins++;
				userB.losses++;

				let expectedScoreA = elo.getExpected(userA.elorating, userB.elorating);
				let expectedScoreB = elo.getExpected(userB.elorating, userA.elorating);

				userA.elorating = elo.updateRating(expectedScoreA, 1, userA.elorating);
				userB.elorating = elo.updateRating(expectedScoreB, 0, userB.elorating);

				// Calculate winstreak based on game history
				let winstreak = 0;
				let lastWin = 0;

				for (let i = 0; i < userA.gamehistory.length; i++) {
					if (userA.gamehistory[i] === 1) {
						lastWin = i;
						winstreak++;
					} else {
						winstreak = 0;
					}
				}

				if (winstreak === 3) {
					userA.elorating += 5;
				} else if (winstreak === 4) {
					userA.elorating += 6;
				} else if (winstreak === 5) {
					userA.elorating += 7;
				} else if (winstreak >= 6) {
					userA.elorating += 8;
				}

				userA.gamehistory.push(1);
				userB.gamehistory.push(0);
			} else {
				userB.wins++;
				userA.losses++;

				let expectedScoreA = elo.getExpected(userA.elorating, userB.elorating);
				let expectedScoreB = elo.getExpected(userB.elorating, userA.elorating);

				userA.elorating = elo.updateRating(expectedScoreA, 0, userA.elorating);
				userB.elorating = elo.updateRating(expectedScoreB, 1, userB.elorating);

				// Calculate winstreak based on game history
				let winstreak = 0;
				let lastWin = 0;

				for (let i = 0; i < userB.gamehistory.length; i++) {
					if (userB.gamehistory[i] === 1) {
						lastWin = i;
						winstreak++;
					} else {
						winstreak = 0;
					}
				}

				if (winstreak === 3) {
					userB.elorating += 5;
				} else if (winstreak === 4) {
					userB.elorating += 6;
				} else if (winstreak === 5) {
					userB.elorating += 7;
				} else if (winstreak >= 6) {
					userB.elorating += 8;
				}

				userB.gamehistory.push(0);
				userB.gamehistory.push(1);
			}

			await userA.save();
			await userB.save();
		}

		interaction.reply(
			"The scores have successfully been submitted, and ELO etc has been affected accordingly.\nWell done and good luck for next time!"
		);

		// LBPos stuff
		var users = await User.find({});
		users.sort((a, b) => b.elorating - a.elorating);

		// Only show users that have actually played a ranked game.
		users = users.filter((user) => user.gamehistory.length > 0);

		//! TODO: BUG FIX THIS AS IT IS FOR SOME REASON NOW SHOWING ON THE STATS OF THE PERSON!
		for (let i = 0; i < users.length; i++) {
			users[i].lbpos = i + 1;
			users[i].save();
		}
	},
});
