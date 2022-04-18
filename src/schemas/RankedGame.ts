import mongoose from "mongoose";

interface IRankedGame {
	gameRef: string;
	teamA: string[];
	teamB: string[];
	scoreSubmitted: boolean;
	gameMap: string;
}

const rankedGameSchema = new mongoose.Schema<IRankedGame>({
	gameRef: String,
	teamA: [String],
	teamB: [String],
	scoreSubmitted: Boolean,
	gameMap: String,
});

export default mongoose.model<IRankedGame>("RankedGame", rankedGameSchema);
