import { Command } from "../../structures/Command";
import User from "../../schemas/User";

import { add } from "date-fns";

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
			name: "is-perm",
			description: "Is the suspension indefinite?",
			type: "BOOLEAN",
			required: true,
		},
		{
			name: "reason",
			description: "The reason for the suspension",
			type: "STRING",
			required: true,
		},
		{
			name: "suspension-time",
			description:
				"The time to suspend the user for, with the unit of time at the end.",
			type: "STRING",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const user = interaction.options.getUser("user");
		const isPerm = interaction.options.getBoolean("is-perm");
		const reason = interaction.options.getString("reason");
		const suspensionTime = interaction.options.getString("suspension-time");

		const userExists = await User.findOne({ discordID: user.id });

		if (!userExists) {
			interaction.reply(
				`${user.username} has not been registered/does not exist to begin with.`
			);
			return;
		}

		if (!suspensionTime.match(/\d+[a-z]{1,2}/g)) {
			interaction.reply({
				content: `${suspensionTime.replace(
					/\d+/g,
					""
				)} is not a valid time unit. Please use one of the following: \`m\`, \`d\`, \`s\`, \`y\`, \`mo\`\n(mo is for months.)`,
				ephemeral: true,
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

				await interaction.reply(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} months.`
				);
				break;

			case "m":
				userExists.suspendedUntil = add(new Date(), {
					months: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "m";

				await interaction.reply(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} minutes.`
				);
				break;

			case "d":
				userExists.suspendedUntil = add(new Date(), {
					days: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "d";

				await interaction.reply(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} days.`
				);
				break;

			case "s":
				userExists.suspendedUntil = add(new Date(), {
					seconds: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "s";

				await interaction.reply(
					`${user.username} has been **suspended** from Ranked Games for ${suspensionTimeAmount} seconds.`
				);
				break;

			case "y":
				userExists.suspendedUntil = add(new Date(), {
					years: suspensionTimeAmount,
				}).getTime();

				userExists.suspensionUnit = "y";

				await interaction.reply(
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
