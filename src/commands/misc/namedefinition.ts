import Eris from "eris";
import { BCommand } from "../../structures/Command";
import { bot } from "../..";
import User from "../../schemas/User";

import dictionary from "../../data/dict.json";

export default new BCommand({
	name: "namedef",
	description: "Get a definition of your name or someone elses",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "User to check name defintion for",
			required: false,
		},
	],

	run: async ({ interaction }) => {
		let member: Eris.Member;
		try {
			const userID = interaction.data.resolved.users.entries().next().value[1].id;

			const userFromDB = await User.findOne({ discordID: userID });
			if (userFromDB && userFromDB.optOutNameChange === true)
				return interaction.createMessage(
					"This person has opted out of all commands relating to nicknames.\nOpt back in with the /nameopt command."
				);

			member = (await bot.guilds.get(interaction.guildID).fetchMembers({ userIDs: [userID] }))[0]; // get user object
		} catch {
			const userFromDB = await User.findOne({ discordID: interaction.member.user.id });
			if (userFromDB && userFromDB.optOutNameChange === true)
				return interaction.createMessage(
					"You have opted out of all commands relating to nicknames.\nOpt back in with the /nameopt command."
				);

			member = interaction.member;
		}

		const nick = member.nick;
		const wordObj = (dictionary as any[]).find((w) => w.word === nick.toUpperCase());
		const defs: string[] = wordObj.definitions;

		let embed: Eris.Embed = {
			type: "rich",
			color: 0xfc0303,
			title: `Definition for ${nick}`,
			description: `${defs.join("\n")}`,
		};

		interaction.createMessage({ embeds: [embed] });
	},
});
