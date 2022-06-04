import { ApplicationCommandStructure, CommandInteraction } from "eris";
import { BetterClient } from "../structures/Client";

interface RunOptions {
	client: BetterClient;
	interaction: CommandInteraction;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = ApplicationCommandStructure & {
	run: RunFunction;
};
