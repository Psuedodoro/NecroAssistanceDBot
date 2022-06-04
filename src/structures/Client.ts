import Eris, {
	ApplicationCommand,
	Client,
	ClientEvents,
	Collection,
} from "eris";
import glob from "glob";
import { promisify } from "util";
import { CommandType } from "../typings/Command";
import { BEvent } from "./Event";
const globPromise = promisify(glob);

export class BetterClient extends Client {
	botToken: string;
	guildID: string;
	commands: Map<string, CommandType> = new Map();

	constructor(token: string, botOptions: Eris.ClientOptions, guildID) {
		super(token, botOptions);
		this.botToken = token;
		this.guildID = guildID;
	}

	async start() {
		await this.registerModules();
		await this.connect();
	}

	async importFile(filePath: string) {
		return (await import(filePath)).default;
	}

	async refreshCommands(commands: CommandType[]) {
		// If there are commands in the guild that aren't in the commands array - remove them by name
		const guildCommands = await this.guilds.get(this.guildID).getCommands();
		const guildCommandNames = guildCommands.map((command) => command.name);
		const commandNames = commands.map((command) => command.name);

		guildCommandNames.forEach(async (commandName) => {
			if (!commandNames.includes(commandName)) {
				await this.guilds.get(this.guildID).deleteCommand(commandName);
			}
		});

		await this.guilds
			.find((g) => g.id === this.guildID)
			.bulkEditCommands(commands);
	}

	async registerModules() {
		const slashCommands: CommandType[] = [];

		const commandFiles = await globPromise(
			`${__dirname}/../commands/*/*{.ts,.js}`
		);

		console.log(`👨‍💻 Registering commands...`);

		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command.name) return;

			this.commands.set(command.name, command);
			slashCommands.push(command);
			console.log(`✔ "${command.name}" command refreshed successfully.`);
		});

		this.on("ready", () => {
			this.refreshCommands(slashCommands);
		});

		// Event Handler
		const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
		eventFiles.forEach(async (filePath) => {
			const event: BEvent<keyof ClientEvents> = await this.importFile(filePath);
			this.on(event.event, event.run);
		});
	}
}
