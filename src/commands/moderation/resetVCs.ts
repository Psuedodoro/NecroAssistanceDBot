import { BCommand } from "../../structures/Command";
import Eris, { VoiceChannel } from "eris";
import { bot } from "../..";

export default new BCommand({
	name: "reset-vcs",
	description: "Put everyone back in the general VC",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,

	run: async ({ interaction }) => {
		const allChannels = bot.guilds
			.get(interaction.guildID)
			.channels.filter(
				(channel) => channel.type === Eris.Constants.ChannelTypes.GUILD_VOICE
			) as VoiceChannel[];

		const allMembers = allChannels.map((channel) => channel.voiceMembers);

		allMembers.forEach((member) => {
			member.map((m) => {
				m.edit(
					{
						channelID: "962385657794277466",
					},
					"Reset VC Command"
				);
			});
		});

		interaction.createMessage({
			content: "Everyone has been moved to the general VC!",
			flags: 64,
		});
	},
});
