import { ExtendedClient } from "./structures/Client";
import mongoose from "mongoose";
import { mongoURI } from "../config.json";

export const client = new ExtendedClient({ intents: 14021 });

mongoose.connect(mongoURI, () => {
	console.log("📂 DB Connected");
});

client.start();
