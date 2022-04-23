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

		if (winningTeam === "team-a") {
			for (let i = 0; i < teamAUsers.length; i++) {
				var personA = teamAUsers[i];
				var personB = teamBUsers[i];

				const personAEloRatingBefore = personA.elorating;
				const personBEloRatingBefore = personB.elorating;

				personA.gamesPlayed++;
				personB.gamesPlayed++;

				personA.wins++;
				personB.losses++;

				personA.gamehistory.push(1);
				personB.gamehistory.push(0);

				//* Elo stuff
				var expectedScoreA = elo.getExpected(
					personA.elorating,
					personB.elorating
				);
				var expectedScoreB = elo.getExpected(
					personB.elorating,
					personA.elorating
				);

				personA.elorating = elo.updateRating(
					expectedScoreA,
					1,
					personA.elorating
				);

				personB.elorating = elo.updateRating(
					expectedScoreB,
					0,
					personB.elorating
				);

				// See if person A has a winstreak from their latest games from past game history, and if so, add the bonus
				var winstreak = 0;
				for (let i = personA.gamehistory.length - 1; i >= 0; i--) {
					if (personA.gamehistory[i] === 1) {
						winstreak++;
					} else {
						break;
					}
				}

				if (winstreak === 3) {
					personA.elorating += 5;
				} else if (winstreak === 4) {
					personA.elorating += 6;
				} else if (winstreak === 5) {
					personA.elorating += 7;
				} else if (winstreak >= 6) {
					personA.elorating += 8;
				}

				personA.ratingChange = personA.elorating - personAEloRatingBefore;
				personB.ratingChange = personBEloRatingBefore - personB.elorating;

				personB.ratingChange = -personA.ratingChange;

				personA.save();
				personB.save();
			}
		} else if (winningTeam === "team-b") {
			for (let i = 0; i < teamAUsers.length; i++) {
				var personA = teamAUsers[i];
				var personB = teamBUsers[i];

				const personAEloRatingBefore = personA.elorating;
				const personBEloRatingBefore = personB.elorating;

				personA.gamesPlayed = personA.gamesPlayed + 1;
				personB.gamesPlayed = personB.gamesPlayed + 1;

				personB.wins++;
				personA.losses++;

				personB.gamehistory.push(1);
				personA.gamehistory.push(0);

				//* Elo stuff
				var expectedScoreA = elo.getExpected(
					personA.elorating,
					personB.elorating
				);

				var expectedScoreB = elo.getExpected(
					personB.elorating,
					personA.elorating
				);

				personA.elorating = elo.updateRating(
					expectedScoreA,
					0,
					personA.elorating
				);
				personB.elorating = elo.updateRating(
					expectedScoreB,
					1,
					personB.elorating
				);

				// See if person B has a winstreak from their latest games from past game history, and if so, add the bonus
				var winstreak = 0;
				for (let i = personB.gamehistory.length - 1; i >= 0; i--) {
					if (personB.gamehistory[i] === 1) {
						winstreak++;
					} else {
						break;
					}
				}

				if (winstreak === 3) {
					personB.elorating += 5;
				} else if (winstreak === 4) {
					personB.elorating += 6;
				} else if (winstreak === 5) {
					personB.elorating += 7;
				} else if (winstreak >= 6) {
					personB.elorating += 8;
				}

				personA.ratingChange = personAEloRatingBefore - personA.elorating;
				personB.ratingChange = personB.elorating - personBEloRatingBefore;

				personA.ratingChange = -personA.ratingChange;

				personA.save();
				personB.save();
			}
		}

		selectedGame.scoreSubmitted = true;
		selectedGame.save();

		interaction.reply(
			"The scores have successfully been submitted, and ELO etc has been affected accordingly.\nWell done and good luck for next time!"
		);

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
