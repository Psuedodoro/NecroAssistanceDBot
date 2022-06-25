import mapsAndInfo from "../data/mapsandinfo.json";
import allAgentClasses from "../data/agentClassesToBan.json";

export default function makeTeams(players: string[], doBanAgents: boolean) {
	// Optional gameID (can be used for ranked games etc)
	const gameRef = Math.random().toString(36).substring(2, 7);

	const allClassList = Object.keys(allAgentClasses);

	var bannedAgents: string[] = [];
	if (doBanAgents) {
		for (let i = 0; i < allClassList.length; i++) {
			const agentsInClass: string[] = allAgentClasses[allClassList[i]];

			bannedAgents.push(
				agentsInClass[Math.floor(Math.random() * agentsInClass.length)]
			);
		}

		const randomSelectedClass: string =
			allClassList[Math.floor(Math.random() * allClassList.length)];
		const randomSelectedAgent: string =
			allAgentClasses[randomSelectedClass][
				Math.floor(Math.random() * allAgentClasses[randomSelectedClass].length)
			];

		bannedAgents.push(randomSelectedAgent);
	}

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
		gameMap: selectedmapname,
		selectedmapimage,
		teamA,
		teamB,
		gameRef,
		bannedAgents,
	};
}
