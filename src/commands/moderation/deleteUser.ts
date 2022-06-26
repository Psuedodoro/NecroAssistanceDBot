import Eris from "eris";
import User from "../../schemas/User";
import { BCommand } from "../../structures/Command";

export default new BCommand({
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	name: "delete-user",
	description: "Delete a user from the database.",
	options: [
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "The user to delete from the Database",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		if (interaction.member.user.id !== "930744788859359282")
			return await interaction.createMessage("You do not have permission to use this command!");

		const user = interaction.data.options[0].value as string;

		const userToDelete = await User.findOne({ discordID: user });

		await userToDelete.delete();

		interaction.createMessage({ flags: 64, content: "User deleted from database." });
	},
});
