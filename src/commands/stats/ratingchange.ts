import User from "../../schemas/User";
import { Constants } from "eris";
const { CHAT_INPUT } = Constants.ApplicationCommandTypes;
import { BCommand } from "../../structures/Command";

export default new BCommand({
	name: "elo-change",
	description: "See how much your ELO rating changed since your last game.",
	type: CHAT_INPUT,

	run: async ({ interaction }) => {
		const userExists = await User.findOne({ discordID: interaction.member.id });

		if (!userExists) {
			interaction.createMessage(
				"You are not registered! Please use the **/register** slash command to get started!"
			);
			return;
		}

		if (userExists.gamehistory.length === 0) {
			interaction.createMessage("You have not played any games yet!");
			return;
		}

		if (userExists.ratingBefore === 0) {
			interaction.createMessage("Your elo has not changed.");
			return;
		}

		interaction.createMessage(
			`Your elo has changed by ${
				userExists.elorating - userExists.ratingBefore
			}`
		);
	},
});
