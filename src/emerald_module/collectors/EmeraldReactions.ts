import { BetterClient } from "../../structures/Client";
import {
	type ICollectorOptions,
	type emeraldCollectedReactions,
	type emeraldDisposedReaction,
	type recievedEmoji,
} from "../Typings";
import EventEmitter from "events";
import {
	CommandInteraction,
	ComponentInteraction,
	Member,
	Message,
} from "eris";

/**
 * A simple Eris interaction collector
 */
export class EmeraldReactionCollector extends EventEmitter {
	options: ICollectorOptions;
	ended: boolean;
	collected: emeraldCollectedReactions[];

	listener: (
		message: Message,
		emoji: recievedEmoji,
		reactor: Member
	) => Promise<boolean>;

	deleted: (
		message: Message,
		emoji: recievedEmoji,
		userID: string
	) => Promise<void>;

	constructor(options: ICollectorOptions) {
		super();

		this.options = options;
		this.ended = false;
		this.collected = [];

		this.listener = (message, emoji, reactor) =>
			this.checkPreConditions(message, emoji, reactor);

		this.deleted = (message, emoji, userID) =>
			this.wasDeleted({ message, emoji, userID });

		this.options.client.on("messageReactionAdd", this.listener);
		this.options.client.on("messageReactionRemove", this.deleted);

		if (options.time) {
			setTimeout(() => this.stopListening("Time Expired"), options.time);
		}
	}

	private async checkPreConditions(
		message: Message,
		emoji: recievedEmoji,
		reactor: Member
	) {
		if (this.options.filter({ message, emoji, reactor })) {
			this.emit("collect", { message, emoji, reactor });

			this.collected.push({ message, emoji, reactor });

			if (this.collected.length >= this.options.maxMatches) {
				this.stopListening("Maximum Matches Reached");
				return true;
			}
		} else {
			return false;
		}
	}

	/**
	 * Handles if the emoji was removed
	 *
	 */
	private async wasDeleted({
		message,
		emoji,
		userID,
	}: emeraldDisposedReaction) {
		if (
			this.collected.find(
				(item) =>
					item.emoji.id === emoji.id &&
					item.message.id === message.id &&
					userID === item.reactor.id
			) !== undefined
		) {
			this.collected = this.collected.filter(
				(item) =>
					!(
						emoji.id === item.emoji.id &&
						message === item.message &&
						userID === item.reactor.id
					)
			);

			this.emit("deleted", { message, emoji, userID });
		}
	}

	/**
	 * Stops collecting interactions and removes the listener from the client
	 */
	stopListening(reason: string) {
		if (this.ended) {
			return;
		}

		this.ended = true;

		this.options.client.removeListener("interactionCreate", this.listener);
		this.options.client.removeListener("messageReactionRemove", this.deleted);

		this.emit("end", this.collected, reason);
	}
}
