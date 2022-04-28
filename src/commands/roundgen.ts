import { Command } from "../structures/Command";

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
	name: "make-rules",
	description: "Generate a round's rules!",
	options: [
		{
			name: "is-haven",
			description: "Is this a game on the haven map with 3 sites?",
			type: "BOOLEAN",
			required: true,
		},
	],

	run: async ({ interaction }) => {
		const isHaven = interaction.options.getBoolean("is-haven");
		const siteSelections = isHaven ? havenSites : standardSites;

		var plantOption =
			plantOptions[Math.floor(Math.random() * plantOptions.length)];
		const selectedSite =
			siteSelections[Math.floor(Math.random() * siteSelections.length)];
		const selectedAbilities =
			abilityChoice[Math.floor(Math.random() * abilityChoice.length)];

		if (selectedSite === "Mid :dart:") {
			plantOption = plantOptions[0];
		}

		interaction.reply({
			embeds: [
				{
					type: "rich",
					title: `A Ruleset Has Been Generated!`,
					description: `Here are the rules for this round:`,
					color: 0x00bbff,
					fields: [
						{
							name: `**Selected Site:**`,
							value: `${selectedSite}`,
							inline: false,
						},
						{
							name: `**Ability Allowances:**`,
							value: `${selectedAbilities}`,
							inline: false,
						},
						{
							name: `**Plant Options:**`,
							value: `${plantOption}`,
							inline: false,
						},
					],
				},
			],
		});
	},
});
