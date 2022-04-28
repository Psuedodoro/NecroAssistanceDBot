import {
	ApplicationCommandDataResolvable,
	ApplicationCommandPermissionData,
	Client,
	ClientEvents,
	Collection,
} from "discord.js";
import { CommandType } from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";

import dotenv from "dotenv";
dotenv.config();

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
	commands: Collection<string, CommandType> = new Collection();

	constructor(intents) {
		super(intents);
	}

	start() {
		this.registerModules();
		this.login(process.env.TOKEN);
	}

	async importFile(filePath: string) {
		return (await import(filePath))?.default;
	}

	async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
		if (guildId) {
			console.log(`📜 Registering commands to ${guildId}`);
			const guild = await this.guilds.cache.get(guildId);
			await guild?.commands.set(commands);
		} else {
			const applicationRegisteredCommands =
				await this.application?.commands.set(commands);
			console.log("Registering global commands");
		}
	}

	async registerModules() {
		// Command Handler
		const slashCommands: ApplicationCommandDataResolvable[] = [];
		const commandFiles = await globPromise(
			`${__dirname}/../commands/*{.ts,.js}`
		);
		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command.name) return;

			this.commands.set(command.name, command);
			slashCommands.push(command);
		});

		this.on("ready", () => {
			this.registerCommands({
				commands: slashCommands,
				guildId: process.env.guildID,
			});
		});

		// Event Handler
		const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = await this.importFile(filePath);
			this.on(event.event, event.run);
		});
	}
}
