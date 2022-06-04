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
			description:
				"The time to suspend the user for, with the unit of time at the end.",
			type: ApplicationCommandOptionTypes.STRING,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const user = interaction.data.resolved.users.get(
			interaction.data.options.find((o) => o.name === "user").value as string
		);
		// TODO: Implement isPerm
		const isPerm = interaction.data.options.find((o) => o.name === "is-perm")
			.value as boolean;
		const reason = interaction.data.options.find((o) => o.name === "reason")
			.value as string;
		const suspensionTime = interaction.data.options.find(
			(o) => o.name === "suspension-time"
		).value as string;

		const userExists = await User.findOne({ discordID: user.id });

		if (!userExists) {
			interaction.createMessage(
				`${user.username} has not been registered/does not exist to begin with.`
			);
			return;
		}

		if (!suspensionTime.match(/\d+[a-z]{1,2}/g)) {
			interaction.createMessage({
				content: `${suspensionTime.replace(
					/\d+/g,
					""
				)} is not a valid time unit. Please use one of the following: \`m\`, \`d\`, \`s\`, \`y\`, \`mo\`\n(mo is for months.)`,
				flags: 64,
			});
		}

		//! TODO: IMPLEMENT INDEFINITE SUSPENSION

		const suspensionTimeUnit = suspensionTime.match(/[a-z]{1,2}/g)[0];
		const suspensionTimeAmount = Number(suspensionTime.match(/\d+/g))[0];

		userExists.suspended = true;
		userExists.suspendedReason = reason;

		switch (suspensionTimeUnit) {
			case "mo":
				userExists.suspendedUntil = add(new Date(), {
					months: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "mo";

				await interaction.createMessage(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} months.`
				);
				break;

			case "m":
				userExists.suspendedUntil = add(new Date(), {
					months: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "m";

				await interaction.createMessage(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} minutes.`
				);
				break;

			case "d":
				userExists.suspendedUntil = add(new Date(), {
					days: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "d";

				await interaction.createMessage(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} days.`
				);
				break;

			case "s":
				userExists.suspendedUntil = add(new Date(), {
					seconds: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "s";

				await interaction.createMessage(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} seconds.`
				);
				break;

			case "y":
				userExists.suspendedUntil = add(new Date(), {
					years: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "y";

				await interaction.createMessage(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} years.`
				);
				break;

			default:
				break;
		}

		await userExists.save();

		return;
	},
});
