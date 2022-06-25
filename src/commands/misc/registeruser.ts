import User from "../../schemas/User";
import Eris, { CommandInteraction } from "eris";
import { BCommand } from "../../structures/Command";

export default new BCommand({
	name: "register",
	description: "Register to use all things ranked!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,

	run: async ({ interaction }) => {
		const userID = interaction.member.id;

		const userExists = await User.findOne({ discordID: userID });

		if (userExists) {
			interaction.createMessage("You are already registered!");
			return;
		} else {
			const newUser = new User({
				discordID: userID,
				elorating: 1500,
				wins: 0,
				losses: 0,
				gamehistory: [],
				gamesPlayed: 0,
				lbpos: 0,
				suspended: false,
			});

			await newUser.save();
			interaction.createMessage("You have now successfully been registered!");
		}
	},
});
