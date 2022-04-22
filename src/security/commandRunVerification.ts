import { CommandInteraction } from "discord.js";
import User, { IUser } from "../schemas/User";

function stdCommandVerification(
	interaction: CommandInteraction,
	userFromDB: IUser,
	userSfromDB?: IUser[]
) {
	var isSuspended = userFromDB.suspended;

	if (userSfromDB) {
		userSfromDB.forEach((user) => {
			if (user.suspended) {
				isSuspended = true;
			}
		});
	}

	//* Other verification
	const isBot = interaction.user.bot;

	if (isBot || isSuspended) return false;
}

export default stdCommandVerification;
