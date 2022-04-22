import {
	ApplicationCommand,
	ApplicationCommandPermissionData,
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable,
} from "discord.js";
import { ExtendedClient } from "../structures/Client";

/* export interface ExtendedInteraction extends CommandInteraction {
	member: GuildMember;
} */

interface RunOptions {
	client: ExtendedClient;
	interaction: CommandInteraction;
	args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
	userPermissions?: PermissionResolvable[];
	commandPermissions?: ApplicationCommandPermissionData[];
	run: RunFunction;
} & ChatInputApplicationCommandData;
