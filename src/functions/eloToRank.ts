export default function eloToRank(elorating: number): string {
	switch (true) {
		case elorating <= 1400:
			return "Iron";
			break;

		case elorating <= 1500:
			return "Bronze";
			break;

		case elorating <= 1600:
			return "Silver";
			break;

		case elorating <= 1700:
			return "Gold";
			break;

		case elorating <= 1800:
			return "Platinum";
			break;

		case elorating < 2000:
			return "Diamond";
			return;

		case elorating >= 2000:
			return "Master";
			return;

		default:
			break;
	}
}
