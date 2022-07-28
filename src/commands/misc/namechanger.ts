import Eris from "eris";
import { BCommand } from "../../structures/Command";
import axios from "axios";
import { bot } from "../..";
import User from "../../schemas/User";

export default new BCommand({
	name: "namerandom",
	description: "Change everyone's name to random words",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,

	run: async ({ interaction }) => {
		await interaction.defer();

		let guildMembers = await bot.guilds.get(interaction.guildID).fetchMembers();

		guildMembers = guildMembers.filter((m) => !m.permissions.has("administrator"));

		for (const m of guildMembers) {
			const userFromDB = await User.findOne({ discordID: m.user.id });
			if (userFromDB && userFromDB.optOutNameChange !== null && userFromDB.optOutNameChange === true) continue;

			const name = await (await axios.get("https://random-word-api.herokuapp.com/word")).data;

			await m.edit({
				nick: name[0],
			});
		}

		interaction.createMessage("Changed all names!");
	},
});
