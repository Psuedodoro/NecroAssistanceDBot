import Eris, { Embed, EmbedField, TextChannel } from "eris";
import { bot } from "../../index";
import { BCommand } from "../../structures/Command";
import User from "../../schemas/User";

import allAgents from "../../data/valorantAgents.json";

export default new BCommand({
	name: "change-agents",
	description: "Change the agents for your profile!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "agent-1",
			description: "The first agent to reserve",
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			required: true,
			choices: allAgents,
		},
		{
			name: "agent-2",
			description: "The second agent to reserve (your backup)",
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			required: true,
			choices: allAgents,
		},
	],

	run: async ({ interaction }) => {
		await interaction.createMessage(
			"This command is currently broken. A fix will come soon."
		);
		return;

		const agent1 = interaction.data.options.find((o) => o.name === "agent-1")
			.value as string;
		const agent2 = interaction.data.options.find((o) => o.name === "agent-2")
			.value as string;

		// Check if there is a message already from the bot in the channel
		const rosterChannel = bot.guilds
			.get(bot.guildID)
			.channels.get("961380756444307496") as TextChannel;

		const messages = await rosterChannel.messages;

		const message = await messages.find(
			(message) => message.author.id === bot.user.id
		);

		const agentsDocument = await User.findOne({
			discordID: interaction.user.id,
		});

		if (!agentsDocument) {
			interaction.createMessage(
				"Please do /register to be able to use this command!"
			);
			return;
		}

		agentsDocument.agents = {
			main: agent1,
			backup: agent2,
		};

		await agentsDocument.save();

		const allUsers = await User.find({}).where("agents.main").ne(null);

		const allServerMembers = bot.guilds.get(interaction.guildID).members;

		let toAddFields: EmbedField[];
		allServerMembers.map((member) => {
			const isUserInAllUsers = allUsers.find(
				(user) => user.discordID === member.id
			);

			if (isUserInAllUsers) {
				toAddFields.push({
					name: `${member.user.username}`,
					value: `Main: ${isUserInAllUsers.agents.main}\nBackup: ${isUserInAllUsers.agents.backup}`,
					inline: false,
				});
			}
		});

		const mainEmbed: Embed = {
			type: "rich",
			title: "Team Necro's Agent Roster!",
			description: `This is the current agent reserve roster for Team Necro!`,
			fields: toAddFields,
			color: 0x0099ff,
		};

		if (message) {
			message.edit({ embeds: [mainEmbed] });
		} else {
			rosterChannel.createMessage({
				embeds: [mainEmbed],
			});
		}

		await interaction.createMessage(
			`Your agents have been updated to ${agent1} and ${agent2} as your backup reserve!`
		);
	},
});
