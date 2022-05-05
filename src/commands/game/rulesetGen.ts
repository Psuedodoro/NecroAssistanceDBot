import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import paginationEmbed from "discord.js-pagination";
import { Command } from "../../structures/Command";

//* Data for the random generation
const plantOptions = [
	"No Planting :no_entry_sign:",
	"Planting Allowed :white_check_mark:",
	"Planting At 30 Seconds Remaining :hourglass:",
	"Planting After Death :skull_crossbones:",
	"Planting is Required :bomb:",
];

const havenSites = [
	"A Site :regional_indicator_a:",
	"B Site :b:",
	"C Site :regional_indicator_c:",
	"Mid :dart:",
];

const standardSites = ["A Site :regional_indicator_a:", "B Site :b:"];

const abilityChoice = [
	"No Damaging Abilities :drop_of_blood:",
	"All Abilities :white_check_mark:",
	"No Abilities :no_entry:",
];

export default new Command({
	name: "gen-ruleset",
	description: "Generate a ruleset for the game's rounds!",
	options: [
		{
			name: "is-haven",
			description: "Is this a game on the haven map with 3 sites?",
			type: "BOOLEAN",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		if (!interaction.inCachedGuild()) return;

		//* Randomised data for the pagination
		const isHaven = interaction.options.getBoolean("is-haven");
		const siteSelections = isHaven ? havenSites : standardSites;

		const genPlantOption = () => {
			return plantOptions[Math.floor(Math.random() * plantOptions.length)];
		};

		const genSelectedSite = () => {
			return siteSelections[Math.floor(Math.random() * siteSelections.length)];
		};

		const genAbilities = () => {
			return abilityChoice[Math.floor(Math.random() * abilityChoice.length)];
		};

		const genRulesEmbed = () => {
			var plantingspec: string = genPlantOption();
			const sitespec: string = genSelectedSite();
			const abilityspec: string = genAbilities();

			if (sitespec === "Mid :dart:") {
				plantingspec = plantOptions[0];
			}

			return new MessageEmbed()
				.setTitle("A Ruleset Has Been Generated!")
				.setDescription("Here are the rules for this round:")
				.setColor(0x00bbff)
				.addField("**Selected Site:**", sitespec)
				.addField("**Ability Allowances:**", abilityspec)
				.addField("**Plant Options:**", plantingspec);
			// TODO: Add page identifier.
			/* .setFooter({
					text: `Page ${pageno} of rules generated.`,
				}); */
		};

		const pages: MessageEmbed[] = [];

		pages.push(genRulesEmbed());

		//* Pagination stuff
		const buttonRow = new MessageActionRow().addComponents(
			new MessageButton()
				.setLabel("◀")
				.setStyle("PRIMARY")
				.setCustomId("leftwardsPage"),

			new MessageButton()
				.setLabel("▶")
				.setCustomId("rightwardsPage")
				.setStyle("PRIMARY")
		);

		let page = 0;

		const message = (await interaction.reply({
			embeds: [pages[page]],
			components: [buttonRow],
			fetchReply: true,
		})) as Message;

		const filter = (i) => {
			return i.user.id === interaction.user.id;
		};

		const collector = message.createMessageComponentCollector({
			filter,
			componentType: "BUTTON",
			time: 300 * 1000,
		});

		collector.on("collect", (buttonInteraction) => {
			collector.resetTimer();

			switch (buttonInteraction.customId) {
				case "leftwardsPage":
					page = page > 0 ? --page : pages.length - 1;
					break;

				case "rightwardsPage":
					pages.push(genRulesEmbed());
					page = page + 1 < pages.length ? ++page : 0;
					break;

				default:
					break;
			}

			message.edit({
				embeds: [pages[page]],
				components: [buttonRow],
			});
		});

		collector.on("end", () => {
			console.log("Collector ended");

			collector.stop();
		});
	},
});
