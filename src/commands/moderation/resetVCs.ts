import { Command } from "../../structures/Command";

import RankedGame from "../../schemas/RankedGame";
import { VoiceChannel } from "discord.js";

export default new Command({
	name: "reset-vcs",
	description: "Put everyone back in the general VC",

	run: async ({ interaction }) => {
		const private1VC = (await interaction.guild.channels.cache.find(
			(channel) => channel.id === "962385681148157992"
		)) as VoiceChannel;

		const private2VC = (await interaction.guild.channels.cache.find(
			(channel) => channel.id === "962385706158788618"
		)) as VoiceChannel;

		const generalVC = (await interaction.guild.channels.cache.find(
			(channel) => channel.id === "962385657794277466"
		)) as VoiceChannel;

		private1VC.members.forEach(async (member) => {
			await member.voice.setChannel(generalVC);
		});

		private2VC.members.forEach(async (member) => {
			await member.voice.setChannel(generalVC);
		});

		interaction.reply({
			content: "Everyone has been moved to the general VC!",
			ephemeral: true,
		});
	},
});
