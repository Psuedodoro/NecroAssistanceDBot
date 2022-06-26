// TODO: Fix logic on command
import Eris, { ActionRow, ComponentInteraction, Embed, Member, User, VoiceChannel } from "eris";
import { bot } from "../..";
import { EmeraldCollector } from "../../emerald_module/collectors/EmeraldButtonInteractions";
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
		const vchannel = bot.getChannel(interaction.data.options[0].value as string) as VoiceChannel;

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

		const defaultUsersInVC = vchannel.voiceMembers.filter((m) => defaultPeople.includes(m.id));

		// Get person to send the vc join request to
		var chosenPerson: Member;
		if (defaultUsersInVC.length > 0) {
			chosenPerson = defaultUsersInVC[Math.floor(Math.random() * defaultUsersInVC.length)];
		} else if (defaultUsersInVC.length === 1) {
			chosenPerson = defaultUsersInVC[0];
		} else {
			chosenPerson = vchannel.voiceMembers.random();
		}

		//* EMBED STUFF
		await interaction.createMessage({
			content: `Sending a VC request to ${chosenPerson.user.username}`,
			flags: 64,
		});

		const requestrow: ActionRow = {
			type: Eris.Constants.ComponentTypes.ACTION_ROW,
			components: [
				{
					type: Eris.Constants.ComponentTypes.BUTTON,
					label: "✅",
					style: Eris.Constants.ButtonStyles.SUCCESS,
					custom_id: "accepttovc",
				},
				{
					type: Eris.Constants.ComponentTypes.BUTTON,
					label: "❌",
					style: Eris.Constants.ButtonStyles.DANGER,
					custom_id: "denytovc",
				},
			],
		};

		const requestEmbed: Embed = {
			title: "Accept the VC join request?",
			description: `${interaction.member.user.username} wants to join your voice channel, and you have been selected at random to accept the request!\nPlease press the corresponding button to allow the user to either join or leave.`,
			type: "rich",
			color: 0xefb859,
		};

		const chosenPersonDMChannel = await chosenPerson.user.getDMChannel();
		const requestMessage = await chosenPersonDMChannel.createMessage({
			embeds: [requestEmbed],
			components: [requestrow],
		});

		const filter = (i: ComponentInteraction) =>
			i.user.id === chosenPerson.user.id && i.channel.id === chosenPersonDMChannel.id && i.message.id === requestMessage.id;

		const collector = new EmeraldCollector({
			client: bot,
			filter: filter,
			time: 5 * 60 * 1000,
		});

		collector.on("collect", async (i: ComponentInteraction) => {
			if (i.data.custom_id === "accepttovc") {
				collector.stopListening("Granted access to VC");

				requestrow.components.forEach((button) => {
					button.disabled = true;
				});

				requestMessage.edit({ components: [requestrow] });

				const updatedEmbed: Embed = {
					type: "rich",
					title: "Accepted VC join request",
					description: `${requestEmbed.description}\n\n***You have accepted this request.***`,
					color: 0x00ff48,
				};

				await requestMessage.edit({ embeds: [updatedEmbed] });

				const vcToMoveTo = chosenPerson.voiceState.channelID;

				await interactionUserInGuild.edit({
					channelID: vcToMoveTo,
				});

				await (
					await interaction.member.user.getDMChannel()
				).createMessage({
					embeds: [
						{
							title: `You Have Been Accepted Into The Voice Channel!`,
							description: `You have been accepted, and successfully moved into the VC you requested to join.`,
							color: 0x00ff48,
						},
					],
				});
				return;
			} else if (i.data.custom_id === "denytovc") {
				collector.stopListening("Denied access to VC");

				requestrow.components.forEach((button) => {
					button.disabled = true;
				});

				requestMessage.edit({ components: [requestrow] });

				const updatedEmbed: Embed = {
					type: "rich",
					title: "You got a VC join request!",
					description: `${requestEmbed.description}\n\n***You have denied this request.***`,
					color: 0xfd0303,
				};

				await requestMessage.edit({ embeds: [updatedEmbed] });

				await (
					await interaction.member.user.getDMChannel()
				).createMessage({
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
			console.log("The VC Request Ended!");
		});
	},
});
