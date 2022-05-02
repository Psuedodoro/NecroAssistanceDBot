import { ExtendedClient } from "./structures/Client";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Intents } from "discord.js";
dotenv.config();

const mongoURI = process.env.mongoURI;

export const client = new ExtendedClient({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_WEBHOOKS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});

mongoose.connect(mongoURI, () => {
	console.log("📂 DB Connected");
});

client.start();
