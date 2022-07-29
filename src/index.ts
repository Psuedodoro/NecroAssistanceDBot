import Eris from "eris";
import mongoose from "mongoose";
import { BetterClient } from "./structures/Client";

require("dotenv").config();
const { botToken, guildID, mongoURI } = process.env;

mongoose.connect(mongoURI);
console.log("Connected to MongoDB");

export const otype = Eris.Constants.ApplicationCommandOptionTypes;

export const bot = new BetterClient(
	botToken,
	{
		intents: ["allNonPrivileged", "guildMembers", "guilds"],
		restMode: true,
	},
	guildID
);

bot.start();
