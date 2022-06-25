export default function eloToRank(elorating: number): string {
	switch (true) {
		case elorating <= 1400:
			return "Iron";

		case elorating <= 1500:
			return "Bronze";

		case elorating <= 1600:
			return "Silver";

		case elorating <= 1700:
			return "Gold";

		case elorating <= 1800:
			return "Platinum";

		case elorating < 2000:
			return "Diamond";

		case elorating >= 2000:
			return "Master";

		default:
			break;
	}
}
