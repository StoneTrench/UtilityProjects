import { readFileSync } from "fs";
import * as http from "http";
import { join } from "path";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export function RandomKeyGenerator(length: number, count: number): string[] {
	const res: string[] = [];
	for (let i = 0; i < count; i++) {
		let part: string = "";
		for (let j = 0; j < length; j++) part += characters[Math.floor(Math.random() * characters.length)];
		res.push(part);
	}
	return res;
}
export class WebImageServer {
	private server: http.Server;
	private port: number;
	private clients: http.ServerResponse[] = [];
	private path: string;
	private title: string;
	private currentImage: Buffer;

	constructor(port: number, title: string) {
		this.port = port;
		this.path = "image"//RandomKeyGenerator(4, 5).join("-");
		this.title = title;
		this.server = this.createHttpServer();
	}

	public start() {
		return new Promise<this>(resolve => {
			this.server.listen(this.port, () => {
				console.log(`Server running at http://localhost:${this.port}/`);
				resolve(this)
			});
		})
	}

	public stop() {
		return new Promise<this>(resolve => {
			this.server.close(() => {
				console.log("Server stopped.");
				resolve(this)
			});
		})
	}

	private createHttpServer(): http.Server {
		return http.createServer((req, res) => {
			if (req.method === "GET" && req.url === "/") {
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(
					readFileSync(join(__dirname, "index.html"), "utf-8")
						.replace("{0}", this.title)
						.replace("{1}", this.path)
				);
			} else if (req.method === "GET" && req.url === `/${this.path}`) {
				// The client will automatically request from the "/image" path
				this.clients.push(res);
				this.updateClientImage(res)
			}
		});
	}

	private updateClientImage(client: http.ServerResponse){
		client.writeHead(200, { "Content-Type": "image/png" });
		client.end(this.currentImage);
		return this;
	}

	private updateClientsImage() {
		this.clients.forEach(this.updateClientImage);
		this.clients = [];
		return this;
	}

	sendImageToClients(image_png: Buffer){
		this.currentImage = image_png;
		this.updateClientsImage();
	}
}
