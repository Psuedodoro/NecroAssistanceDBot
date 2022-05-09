export default async function awaitTimeout(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
