import Eris from "eris";
import User from "../../schemas/User";
import { BCommand } from "../../structures/Command";

export default new BCommand({
	name: "nameopt",
	description: "Automatically opt in/out of the random name command",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,

	run: async ({ interaction }) => {
		// Get the user from DB, then affect the name opt property
		const user = await User.findOne({ discordID: interaction.member.user.id });

		if (!user) return interaction.createMessage("No user found in the DB. Please register first using /register!");

		user.optOutNameChange = !user.optOutNameChange;
		await user.save();

		const inOrOut = user.optOutNameChange ? "out" : "in";

		interaction.createMessage({ flags: 64, content: `You have opted ${inOrOut} of all commands relating to nicknames.` });
	},
});
