import { Command } from "../structures/Command";

export default new Command({
	name: "suspend-user",
	description: "Suspend a user from playing Ranked Games",
	options: [
		{
			name: "user",
			description: "The user to suspend",
			type: "USER",
			required: true,
		},
		{
			name: "suspended-length",
			description:
				"Amount of seconds to suspend the player for, 0 is permanent",
			type: "STRING",
			required: true,
		},
		{
			name: "reason",
			description: "Reason for suspending the player",
			type: "STRING",
			required: true,
		},
	],

	run: async (interaction) => {
		const user = interaction.options.getUser("user");
		const userName = user.username;
		const reason = interaction.options.getString("reason");

		const userExists = await User.findOne({ discordID: user.id });

		if (!userExists) {
			interaction.reply(
				`${userName} has not been registered/does not exist to begin with.`
			);
			return;
		}

		if (length === 0) {
			await interaction.reply(
				`${userName} has been permanently suspended from Ranked Games`
			);

			userExists.suspended = true;
			userExists.suspendedUntil = null;
			userExists.suspendedReason = null;
			userExists.suspendedReason = reason;

			await userExists.save();
			return;
		} else {
			userExists.suspendedUntil = Math.round(Date.now() / 1000) + length;
			userExists.suspended = true;
			userExists.suspendedReason = null;
			userExists.suspendedReason = reason;

			await userExists.save();

			await interaction.reply(
				`${userName} has been suspended from Ranked Games for ${length} minutes`
			);
		}
	},
});
