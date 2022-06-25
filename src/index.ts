import Eris, { Client, type ApplicationCommand } from "eris";
import mongoose from "mongoose";
import { botToken, guildID, mongoURI } from "../config.json";
import { BetterClient } from "./structures/Client";

mongoose.connect(mongoURI);
console.log("Connected to MongoDB");

export const otype = Eris.Constants.ApplicationCommandOptionTypes;

export const bot = new BetterClient(
	botToken,
	{
		intents: ["allNonPrivileged"],
		restMode: true,
	},
	guildID
);

bot.start();
