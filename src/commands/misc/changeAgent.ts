import Eris, { Embed, EmbedField, Message, TextChannel } from "eris";
import { bot } from "../../index";
import { BCommand } from "../../structures/Command";
import User from "../../schemas/User";
import { rosterChannelID } from "../../../config.json";

import allAgents from "../../data/valorantAgents.json";

export default new BCommand({
	name: "change-agents",
	description: "Change the agents for your profile!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "agent-1",
			description: "The first agent to reserve (your primary agent)",
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
		const rosterChannel = bot.getChannel(rosterChannelID) as TextChannel;
		let msg = (await rosterChannel.getMessages({ limit: 5 })).filter((m) => m.author.id === bot.user.id);

		const agent1 = interaction.data.options.find((o) => o.name === "agent-1").value as string;
		const agent2 = interaction.data.options.find((o) => o.name === "agent-2").value as string;

		// Get user from database via discord id
		const user = await User.findOne({
			discordID: interaction.member.id,
		});

		if (user.agentChangeCooldown > Date.now()) {
			const timeLeft = user.agentChangeCooldown - Date.now();
			const timeLeftString = `${Math.floor(timeLeft / 1000 / 60)} minutes and ${Math.floor((timeLeft / 1000) % 60)} seconds`;
			interaction.createMessage({ content: `You must wait ${timeLeftString} before changing your agents again.`, flags: 64 });
			return;
		} else {
			user.agentChangeCooldown = Date.now() + 86400000; // +24 Hours
		}

		if (!user)
			return await interaction.createMessage(
				"No user found. Either register or try again later.\nIf the error persists, please report it to the bot owner."
			);

		user.agents.main = agent1;
		user.agents.backup = agent2;

		await user.save();

		var allUsers = (
			await User.find({}).where("agents.main").ne(null).select("discordID agents.main agents.backup suspended")
		).filter((u) => u.suspended === false);

		const fields = [];

		for (const user of allUsers) {
			fields.push({
				name: `${
					bot.users.get(user.discordID)
						? bot.users.get(user.discordID).username
						: (await bot.getRESTUser(user.discordID)).username
				}`,
				value: `Main: ${user.agents.main}\nBackup: ${user.agents.backup}`,
				inline: false,
			});
		}

		const embed: Eris.Embed = {
			type: "rich",
			title: "Team Necro's Agent Roster!",
			description: "This is the current agent reserve roster for Team Necro!",
			fields,
		};

		if (msg && msg.length > 0 && msg[0]) {
			await msg[0].edit({ embeds: [embed] });
		} else {
			await rosterChannel.createMessage({ embeds: [embed] });
		}

		await interaction.createMessage("Agents changed successfully.");
	},
});
