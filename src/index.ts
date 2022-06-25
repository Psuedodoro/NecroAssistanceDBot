import Eris, { Client, type ApplicationCommand } from "eris";
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
		intents: ["allNonPrivileged"],
		restMode: true,
	},
	guildID
);

bot.start();
