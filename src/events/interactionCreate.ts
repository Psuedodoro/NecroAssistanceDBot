import {
	CommandInteraction,
	CommandInteractionOptionResolver,
} from "discord.js";
import { client } from "..";
import { Event } from "../structures/Event";

export default new Event("interactionCreate", async (interaction) => {
	// Chat Input Commands
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command)
			return interaction.reply("You have used a non existent command");

		command.run({
			args: interaction.options as CommandInteractionOptionResolver,
			client,
			interaction: interaction as CommandInteraction,
		});
	}
});
