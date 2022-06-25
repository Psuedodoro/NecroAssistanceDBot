import mongoose from "mongoose";

export interface IAgentReservation {
	main: string;
	backup: string;
}

export interface IPastUser {
	discordID: string;
	elorating: number;
	wins: number;
	losses: number;
	gamehistory: number[];
	gamesPlayed: number;
	lbpos: number;
	ratingBefore: number;
	suspended: boolean;
	suspendedUntil: number;
	suspendedReason: string;
	suspensionUnit: string;
	agents: IAgentReservation;
	rank: string;
	cooldown1v1: number;
	agentChangeCooldown: number;
}

const pastUserSchema = new mongoose.Schema<IPastUser>({
	discordID: String,
	elorating: Number,
	wins: Number,
	losses: Number,
	gamehistory: [Number],
	gamesPlayed: Number,
	lbpos: Number,
	ratingBefore: Number,
	suspended: Boolean,
	suspendedUntil: Number,
	suspendedReason: String,
	suspensionUnit: String,
	agents: {
		main: String,
		backup: String,
	},
	rank: String,
	cooldown1v1: Number,
	agentChangeCooldown: Number,
});

export default mongoose.model<IPastUser>("PastUser", pastUserSchema);
