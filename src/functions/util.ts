// Personal util file

export function randomObjKey(obj: any) {
	var keys = Object.keys(obj);
	return keys[(keys.length * Math.random()) << 0];
}

export function randomArrItem(arr: any) {
	return arr[Math.floor(Math.random() * arr.length)];
}
