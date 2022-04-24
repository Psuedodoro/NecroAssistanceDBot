import { ExtendedClient } from "./structures/Client";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.mongoURI;

export const client = new ExtendedClient({ intents: 14021 });

mongoose.connect(mongoURI, () => {
	console.log("📂 DB Connected");
});

client.start();
