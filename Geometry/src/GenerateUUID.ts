export function GetDateString() {
	const date = new Date();
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	const hour = `${date.getHours()}`.padStart(2, "0");
	const minute = `${date.getMinutes()}`.padStart(2, "0");
	const second = `${date.getSeconds()}`.padStart(2, "0");
	return `${year}_${month}_${day}-${hour}_${minute}_${second}`;
}

export function GenerateTimestampID(): string {
	const timestamp = Date.now().toString(36);
	const randomPart = Math.random().toString(36).substring(2, 5);
	return `${timestamp}-${randomPart}`;
}
export function GenerateSnowflakeID(): string {
	const timestamp = BigInt(Date.now()) << BigInt(22); // First 41 bits for the timestamp
	const randomPart = BigInt(Math.floor(Math.random() * 1024)); // Last 10 bits for randomness
	return (timestamp | randomPart).toString();
}
export function GenerateRandomUUID(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
		const random = (Math.random() * 16) | 0;
		const value = char === "x" ? random : (random & 0x3) | 0x8;
		return value.toString(16);
	});
}
export function GenerateHashID(data: string): string {
	let hash = 0;
	for (let i = 0; i < data.length; i++) {
		const char = data.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return hash.toString(16);
}
