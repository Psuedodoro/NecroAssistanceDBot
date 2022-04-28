import { Command } from "../structures/Command";

import User from "../schemas/User";

export default new Command({
	name: "unsuspend-user",
	description: "Unsuspend a user.",
	options: [
		{
			name: "user",
			description: "The user to unsuspend",
			type: "USER",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const user = interaction.options.getUser("user");

		const userExists = await User.findOne({
			discordID: user.id,
		});

		if (!userExists) {
			interaction.reply("This person does not exist in the database.");
			return;
		}

		if (userExists.suspended === false) {
			interaction.reply("This person is not suspended.");
			return;
		}

		interaction.reply(
			`${user.username} has been **unsuspended** successfully.`
		);

		userExists.suspended = false;
		userExists.suspendedReason = "";
		userExists.suspendedUntil = null;
		await userExists.save();
	},
});
