import { BCommand } from "../../structures/Command";
import Eris from "eris";
import User from "../../schemas/User";

export default new BCommand({
	name: "unsuspend-user",
	description: "Unsuspend a user.",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "user",
			description: "The user to unsuspend",
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const user: Eris.User = interaction.data.resolved.users
			.values()
			.next().value;

		const userExists = await User.findOne({
			discordID: user.id,
		});

		if (!userExists) {
			interaction.createMessage("This person does not exist in the database.");
			return;
		}

		if (userExists.suspended === false) {
			interaction.createMessage("This person is not suspended.");
			return;
		}

		interaction.createMessage(
			`${user.username} has been **unsuspended** successfully.`
		);

		userExists.suspended = false;
		userExists.suspendedReason = "";
		userExists.suspendedUntil = null;
		await userExists.save();
	},
});
