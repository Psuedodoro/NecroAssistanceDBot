import Eris from "eris";
import { BCommand } from "../../structures/Command";
import axios from "axios";
import { bot } from "../..";
import User from "../../schemas/User";

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

		const nick = encodeURIComponent(member.nick);

		if (nick === null)
			return interaction.createMessage({ flags: 64, content: "The user selected has no nickname in the server!" });

		try {
			var defs: any[] = await (
				await axios.get(`https://wordsapiv1.p.rapidapi.com/words/${nick}/definitions`, {
					headers: {
						"X-RapidAPI-Key": "7002f7b421msh2ae07c07e1e24cfp1c6503jsnee60897ec4c1",
						"X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
					},
				})
			).data.definitions;
		} catch {
			return interaction.createMessage({ flags: 64, content: "Your name does not exist in the english dictionary." });
		}

		if (defs.length <= 0 || !defs[0])
			return interaction.createMessage({ flags: 64, content: "Your name does not exist in the english dictionary." });

		let embed: Eris.Embed = {
			type: "rich",
			color: 0xfc0303,
			title: `Definition for ${nick}`,
		};

		let fields: Eris.EmbedField[] = [];
		for (const def of defs) fields.push({ name: def.partOfSpeech, value: def.definition });

		embed.fields = fields;

		interaction.createMessage({ embeds: [embed] });
	},
});
