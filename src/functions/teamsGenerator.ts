import mapsAndInfo from "../mapsandinfo.json";

export default function makeTeams(players: string[]) {
	// Optional gameID (can be used for ranked games etc)
	const gameRef = Math.random().toString(36).substring(2, 7);

	var teamA = [];
	var teamB = [];

	players.sort(() => Math.random() - 0.5);

	for (var i = 0; i < players.length; i++) {
		if (i % 2 == 0) {
			teamA.push(players[i]);
		} else {
			teamB.push(players[i]);
		}
	}

	const randBool = Math.random() >= 0.5;

	const isEvenGame = players.length % 2 == 0;

	if (!isEvenGame) {
		if (randBool) {
			teamB.push(teamA.pop());
		}
	}

	const selectedMap =
		mapsAndInfo[Math.floor(Math.random() * mapsAndInfo.length)];

	const selectedmapname = selectedMap.name;
	const selectedmapimage = selectedMap.image;

	return {
		selectedmapname,
		selectedmapimage,
		teamA,
		teamB,
		gameRef,
	};
}
