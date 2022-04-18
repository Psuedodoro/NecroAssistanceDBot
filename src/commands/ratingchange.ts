import User from "../schemas/User";

import { Command } from "../structures/Command";

export default new Command({
	name: "elo-change",
	description: "See how much your ELO rating changed since your last game.",

	run: async ({ interaction }) => {
		const user = interaction.user;

		const userExists = await User.findOne({ discordID: user.id });

		if (!userExists) {
			interaction.reply(
				"You are not registered! Please use the **/register** slash command to get started!"
			);
			return;
		}

		if (userExists.gamehistory.length === 0) {
			interaction.reply("You have not played any games yet!");
			return;
		}

		if (userExists.ratingChange === 0) {
			interaction.reply("Your elo has not changed.");
			return;
		}

		interaction.reply(
			"Your ELO rating has recently changed by " + userExists.ratingChange + "!"
		);
	},
});
