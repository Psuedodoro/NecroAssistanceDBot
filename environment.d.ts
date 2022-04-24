declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			clientID: string;
			guildID: string;
			mongoURI: string;
		}
	}
}

export {};
