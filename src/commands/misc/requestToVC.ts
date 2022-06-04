import Eris, {
	ButtonInteraction,
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	User,
	VoiceChannel,
} from "eris";
import { bot } from "../..";
import { BCommand } from "../../structures/Command";

const defaultPeople = ["500320519455899658", "930744788859359282"];

export default new BCommand({
	name: "request-vc",
	description: "Request a member in a voice channel to join",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "vc",
			description: "voice channel to join",
			type: Eris.Constants.ApplicationCommandOptionTypes.CHANNEL,
			channel_types: [Eris.Constants.ChannelTypes.GUILD_VOICE],
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const vchannel = interaction.data.resolved.channels.get(
			interaction.data.options[0].value as string
		) as VoiceChannel;

		const interactionUserInGuild = interaction.member;

		if (!interactionUserInGuild.voiceState.channelID) {
			interaction.createMessage({
				content: "You need to be in a voice channel to request to join a VC!",
				flags: 64,
			});
			return;
		}

		if (!vchannel) {
			return interaction.createMessage({
				content: "Invalid voice channel",
				flags: 64,
			});
		}

		if (vchannel.voiceMembers.size === 0) {
			return interaction.createMessage({
				content: "No members in this channel to send a request to!",
				flags: 64,
			});
		}

		const defaultUsersInVC = vchannel.voiceMembers.filter((m) =>
			defaultPeople.includes(m.id)
		);

		// Get person to send the vc join request to
		var chosenPerson: GuildMember;
		if (defaultUsersInVC.length > 0) {
			chosenPerson = defaultUsersInVC.random();
		} else if (defaultUsersInVC.length === 1) {
			chosenPerson = defaultUsersInVC.first();
		} else {
			chosenPerson = vchannel.voiceMembers.random();
		}

		await interaction.createMessage({
			content: `Sending a VC request to ${chosenPerson.user.username}`,
			flags: 64,
		});

		const requestrow = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId("accepttovc")
				.setLabel("✅")
				.setStyle("SUCCESS"),

			new MessageButton()
				.setCustomId("denytovc")
				.setLabel("❌")
				.setStyle("DANGER")
		);

		const requestEmbed = new MessageEmbed()
			.setTitle("Accept the VC join request?")
			.setDescription(
				`${interaction.user.username} wants to join your voice channel, and you have been selected at random to accept the request!\nPlease press the corresponding button to allow the user to either join or leave.`
			)
			.setColor(0xefb859);

		const requestMessage = await chosenPerson.user.send({
			embeds: [requestEmbed],
			components: [requestrow],
		});

		const filter = (i) => {
			return i.user.id === chosenPerson.user.id;
		};

		const collector = requestMessage.createMessageComponentCollector({
			filter,
			componentType: "BUTTON",
			time: 300 * 1000,
		});

		var idledDenied = true;
		collector.on("collect", async (ButtonInteraction) => {
			idledDenied = false;

			if (ButtonInteraction.customId === "accepttovc") {
				collector.stop();

				requestrow.components.forEach((button) => {
					button.setDisabled(true);
				});

				requestMessage.edit({ components: [requestrow] });

				const updatedEmbed = new MessageEmbed()
					.setTitle("You got a VC join request!")
					.setDescription(
						`${requestEmbed.description}\n\n***You have accepted this request.***`
					)
					.setColor(0x00ff48);

				await requestMessage.edit({ embeds: [updatedEmbed] });

				const vcToMoveTo = (await interaction.guild.channels.cache.find(
					(channel) => channel.id === chosenPerson.voice.channel.id
				)) as VoiceChannel;

				await interactionUserInGuild.voice.setChannel(vcToMoveTo);

				await interaction.user.send({
					embeds: [
						{
							title: `You Have Been Accepted Into The Voice Channel!`,
							description: `You have been accepted, and successfully moved into the VC you requested to join.`,
							color: 0x00ff48,
						},
					],
				});
				return;
			} else if (ButtonInteraction.customId === "denytovc") {
				collector.stop();

				requestrow.components.forEach((button) => {
					button.setDisabled(true);
				});

				requestMessage.edit({ components: [requestrow] });

				const updatedEmbed = new MessageEmbed()
					.setTitle("You got a VC join request!")
					.setDescription(
						`${requestEmbed.description}\n\n***You have denied this request.***`
					)
					.setColor(0xfd0303);

				await requestMessage.edit({ embeds: [updatedEmbed] });

				await interaction.user.send({
					embeds: [
						{
							title: `You Have Been Denied Your VC Join Request!`,
							description: `You have been denied access to the VC you requested to join.\nPlease take it up with the person accepting your request (<@${chosenPerson.user.id}>)`,
							color: 0xfd0303,
						},
					],
				});
				return;
			}
		});
	},
});
