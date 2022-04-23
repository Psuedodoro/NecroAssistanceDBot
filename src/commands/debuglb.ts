import { Command } from "../structures/Command";
import User from "../schemas/User";

export default new Command({
	name: "debug-lb",
	description: "Rolls back everyone's stats to the game before last.",
	commandPermissions: [
		{
			id: "930744788859359282",
			type: "USER",
			permission: true,
		},
		{
			id: "961380756444307496",
			type: "ROLE",
			permission: false,
		},
	],

	run: async ({ interaction }) => {
		var users = await User.find({});
		users.sort((a, b) => b.elorating - a.elorating);

		users = users.filter((user) => user.gamehistory.length > 0);

		for (let i = 0; i < users.length; i++) {
			const user = users[i];

			user.lbpos = i + 1;

			user.save();
		}

		interaction.reply("LB Positions have been updated.");
	},
});
