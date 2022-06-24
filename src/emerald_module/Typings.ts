import { type Message, type Member } from "eris";
import { type BetterClient } from "../structures/Client";

export interface recievedEmoji {
	animated: boolean;
	id: string;
	name: string;
}

export interface ICollectorOptions {
	time: number;
	filter: (reaction: any) => boolean;
	client: BetterClient;
	maxMatches?: number;
}

export interface emeraldCollectedReactions {
	message: Message;
	emoji: recievedEmoji;
	reactor: Member;
}

export interface emeraldDisposedReaction {
	message: Message;
	emoji: recievedEmoji;
	userID: string;
}
