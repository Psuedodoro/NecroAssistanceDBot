import {
	ButtonInteraction,
	GuildMember,
	MessageActionRow,
	MessageButton,
	User,
	VoiceChannel,
} from "discord.js";
import { Command } from "../../structures/Command";

const defaultPeople = ["500320519455899658", "930744788859359282"];

export default new Command({
	name: "request-vc",
	description: "Request a member in a voice channel to join",
	options: [
		{
			name: "vc",
			description: "voice channel to join",
			type: "CHANNEL",
			channelTypes: ["GUILD_VOICE"],
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const vchannel = interaction.options.getChannel("vc") as VoiceChannel;

		const interactionUserInGuild = interaction.guild.members.cache.find(
			(member) => member.id === interaction.user.id
		);

		if (!interactionUserInGuild.voice.channel) {
			interaction.reply({
				content: "You need to be in a voice channel to request to join a VC!",
				ephemeral: true,
			});
			return;
		}

		if (!vchannel) {
			return interaction.reply({
				content: "Invalid voice channel",
				ephemeral: true,
			});
		}

		if (vchannel.members.size === 0) {
			return interaction.reply({
				content: "No members in this channel",
				ephemeral: true,
			});
		}

		const defaultUsersInVC = vchannel.members.filter((m) =>
			defaultPeople.includes(m.id)
		);

		// Get person to send the vc join request to
		var chosenPerson: GuildMember;
		if (defaultUsersInVC.size > 0) {
			chosenPerson = defaultUsersInVC.random();
		} else if (defaultUsersInVC.size === 1) {
			chosenPerson = defaultUsersInVC.first();
		} else {
			chosenPerson = vchannel.members.random();
		}

		await interaction.reply({
			content: `Sending a VC request to ${chosenPerson.user.username}`,
			ephemeral: true,
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

		const requestMessage = await chosenPerson.user.send({
			embeds: [
				{
					title: "You got a VC join request!",
					description: `${interaction.user.username} wants to join your voice channel, and you have been selected at random to accept the request!\nPlease press the corresponding button to allow the user to either join or leave.`,
					color: 0xefb859,
				},
			],
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

				await chosenPerson.user.send({
					embeds: [
						{
							title: `Successfully accepted the VC join request!`,
							description: `You have successfully accepted the VC join request from ${interaction.user.username}`,
							color: 0x00ff48,
						},
					],
				});

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

				await chosenPerson.user.send({
					embeds: [
						{
							title: `Successfully denied the VC join request!`,
							description: `You have successfully denied the VC join request from ${interaction.user.username}`,
							color: 0x00ff48,
						},
					],
				});

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

		collector.on("end", async () => {
			requestrow.setComponents().components.forEach((button) => {
				button.setDisabled(true);
			});
		});
	},
});
