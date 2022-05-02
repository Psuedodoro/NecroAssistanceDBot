import { MessageEmbed, TextChannel } from "discord.js";
import { client } from "../../index";
import { Command } from "../../structures/Command";
import User from "../../schemas/User";

import allAgents from "../../data/valorantAgents.json";

export default new Command({
	name: "change-agents",
	description: "Change the agents for your profile!",
	options: [
		{
			name: "agent-1",
			description: "The first agent to reserve",
			type: "STRING",
			required: true,
			choices: allAgents,
		},
		{
			name: "agent-2",
			description: "The second agent to reserve (your backup)",
			type: "STRING",
			required: true,
			choices: allAgents,
		},
	],

	run: async ({ interaction }) => {
		if (!interaction.inCachedGuild()) return;
		const agent1 = interaction.options.getString("agent-1");
		const agent2 = interaction.options.getString("agent-2");

		// Check if there is a message already from the bot in the channel
		const rosterChannel = (await client.channels.cache.get(
			"968614939457646623"
		)) as TextChannel;

		const messages = await rosterChannel.messages.fetch({ limit: 20 });

		const message = await messages.find(
			(message) => message.author.id === "962483889031499796"
		);

		const agentsDocument = await User.findOne({
			discordID: interaction.user.id,
		});

		if (!agentsDocument) {
			interaction.reply("Please do /register to be able to use this command!");
			return;
		}

		agentsDocument.agents = {
			main: agent1,
			backup: agent2,
		};

		await agentsDocument.save();

		const allUsers = await User.find({}).where("agents.main").ne(null);

		const mainEmbed = new MessageEmbed()
			.setColor("#0099ff")
			.setTitle("Team Necro's Agent Roster!")
			.setDescription(
				`This is the current agent reserve roster for Team Necro!`
			);

		const allServerMembers = await interaction.guild.members.fetch();

		allServerMembers.map((member) => {
			const isUserInAllUsers = allUsers.find(
				(user) => user.discordID === member.id
			);

			if (isUserInAllUsers) {
				mainEmbed.addField(
					`${member.user.username}`,
					`Main: ${isUserInAllUsers.agents.main}\nBackup: ${isUserInAllUsers.agents.backup}`
				);
			}
		});

		if (message) {
			message.edit({ embeds: [mainEmbed] });
		} else {
			rosterChannel.send({
				embeds: [mainEmbed],
			});
		}

		await interaction.reply(
			`Your agents have been updated to ${agent1} and ${agent2} as your backup reserve!`
		);
	},
});
