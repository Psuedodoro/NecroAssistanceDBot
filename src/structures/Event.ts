import { ClientEvents } from "eris";

export class BEvent<Key extends keyof ClientEvents> {
	constructor(
		public event: Key,
		public run: (...args: ClientEvents[Key]) => any
	) {}
}
