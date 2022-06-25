import { CommandType } from "../typings/Command";

export class BCommand {
	constructor(commandOptions: CommandType) {
		Object.assign(this, commandOptions);
	}
}
