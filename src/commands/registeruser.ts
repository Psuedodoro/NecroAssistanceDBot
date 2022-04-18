import User from "../schemas/User";

import { CommandInteraction } from "discord.js";
import { Command } from "../structures/Command";

export default new Command({
	name: "register",
	description: "Register to use all things ranked!",

	run: async ({ interaction }) => {
		const user = interaction.user;

		const userExists = await User.findOne({ discordID: user.id });

		if (userExists) {
			interaction.reply("You are already registered!");
			return;
		} else {
			const newUser = new User({
				discordID: user.id,
				elorating: 1500,
				wins: 0,
				losses: 0,
				gamehistory: [],
				gamesPlayed: 0,
				lbpos: 0,
			});

			await newUser.save();
			interaction.reply("You have now successfully been registered!");
		}
	},
});
