import Eris, { ActionRow, ComponentInteraction, Embed, Message } from "eris";
import { bot } from "../..";
import { EmeraldCollector } from "../../emerald_module/collectors/EmeraldButtonInteractions";
import { BCommand } from "../../structures/Command";

//* Data for the random generation
const plantOptions = [
	"No Planting :no_entry_sign:",
	"Planting Allowed :white_check_mark:",
	"Planting At 30 Seconds Remaining :hourglass:",
	"Planting After Death :skull_crossbones:",
	"Planting is Required :bomb:",
];

const havenSites = ["A Site :regional_indicator_a:", "B Site :b:", "C Site :regional_indicator_c:", "Mid :dart:"];

const standardSites = ["A Site :regional_indicator_a:", "B Site :b:"];

const abilityChoice = ["No Damaging Abilities :drop_of_blood:", "All Abilities :white_check_mark:", "No Abilities :no_entry:"];

export default new BCommand({
	name: "generate-rules",
	description: "Generate a ruleset for the game's rounds!",
	type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
	options: [
		{
			name: "is-haven",
			description: "Is this a game on the haven map with 3 sites?",
			type: Eris.Constants.ApplicationCommandOptionTypes.BOOLEAN,
			required: true,
		},
	],

	run: async ({ interaction }) => {
		//* Randomised data for the pagination
		const isHaven = interaction.data.options[0].value as boolean;
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

			const builtEmbed: Embed = {
				type: "rich",
				title: "A Ruleset Has Been Generated!",
				description: "Here are the rules for this round:",
				color: 0x00bbff,
				fields: [
					{
						name: "**Selected Site:**",
						value: sitespec,
					},
					{
						name: "**Ability Allowances:**",
						value: abilityspec,
					},
					{
						name: "**Plant Options:**",
						value: plantingspec,
					},
				],
			};

			return builtEmbed;
		};

		const pages: Embed[] = [];

		pages.push(genRulesEmbed());

		//* Pagination stuff
		const buttonRow: ActionRow = {
			type: Eris.Constants.ComponentTypes.ACTION_ROW,
			components: [
				{
					type: Eris.Constants.ComponentTypes.BUTTON,
					label: "◀",
					style: Eris.Constants.ButtonStyles.PRIMARY,
					custom_id: "leftwardsPage",
				},
				{
					type: Eris.Constants.ComponentTypes.BUTTON,
					label: "▶",
					style: Eris.Constants.ButtonStyles.PRIMARY,
					custom_id: "rightwardsPage",
				},
			],
		};

		let page = 0;

		await interaction.createMessage({
			embeds: [pages[page]],
			components: [buttonRow],
		});

		const msg = await interaction.getOriginalMessage();

		const filter = (i: ComponentInteraction) => {
			return i.member.id === interaction.member.id;
		};

		const collector = new EmeraldCollector({
			client: bot,
			filter,
			time: 40 * 60 * 1000,
		});

		collector.on("collect", async (i: ComponentInteraction) => {
			collector.resetTimer();

			switch (i.data.custom_id) {
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

			await msg.edit({
				embeds: [pages[page]],
				components: [buttonRow],
			});
		});

		collector.on("end", () => {
			const disabledrow = { ...buttonRow };
			disabledrow.components[0].disabled = true;
			disabledrow.components[1].disabled = true;

			msg.edit({ components: [disabledrow] });
		});
	},
});
