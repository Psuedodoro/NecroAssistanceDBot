import { BCommand } from "../../structures/Command";
import User from "../../schemas/User";
import { add } from "date-fns";
import Eris from "eris";
const { ApplicationCommandOptionTypes, ApplicationCommandTypes } =
	Eris.Constants;

export default new BCommand({
	name: "suspend-user",
	description: "Suspend a user from playing Ranked Games",
	type: ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "user",
			description: "The user to suspend",
			type: ApplicationCommandOptionTypes.USER,
			required: true,
		},
		{
			name: "is-perm",
			description: "Is the suspension indefinite?",
			type: ApplicationCommandOptionTypes.BOOLEAN,
			required: true,
		},
		{
			name: "reason",
			description: "The reason for the suspension",
			type: ApplicationCommandOptionTypes.STRING,
			required: true,
		},
		{
			name: "suspension-time",
			description: "Suspension length in minutes",
			type: ApplicationCommandOptionTypes.STRING,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const user: Eris.User = interaction.data.resolved.users
			.values()
			.next().value;

		// TODO: Implement isPerm
		const isPerm = interaction.data.options.find((o) => o.name === "is-perm")
			.value as boolean;
		const reason = interaction.data.options.find((o) => o.name === "reason")
			.value as string;

		let suspensionTime = interaction.data.options.find(
			(o) => o.name === "suspension-time"
		).value as number;

		//! HERE!
		if (Number(suspensionTime) === NaN)
			return await interaction.createMessage("Invalid suspension time.");
		else suspensionTime = suspensionTime as number;

		const userExists = await User.findOne({ discordID: user.id });

		if (!userExists) {
			interaction.createMessage(
				`${user.username} has not been registered/does not exist to begin with.`
			);
			return;
		}

		userExists.suspended = true;
		userExists.suspendedReason = reason;

		userExists.suspendedUntil = add(new Date(), {
			minutes: suspensionTime as number,
		}).getTime();

		userExists.suspensionUnit = "m";

		await interaction.createMessage(
			`${user.username} has been **suspended** from Ranked Games for ${suspensionTime} minutes.`
		);

		await userExists.save();

		return;
	},
});
