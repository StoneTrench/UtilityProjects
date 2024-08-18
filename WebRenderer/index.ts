import { createCanvas } from "canvas";
import { WebImageServer } from "./WebViewer";
import { CanvasHelper } from "./CanvasHelper";

(async () => {
	console.log("Started");
	const server = await new WebImageServer(8800, "Web Image Server").start();

	const canvas = createCanvas(1024, 1024);
	const context = canvas.getContext("2d");

    CanvasHelper.SetBackground(context, "#FFFFFF")

    context.arc(512, 512, 100, 0, Math.PI * 2)
	context.stroke();

	server.sendImageToClients(canvas.toBuffer("image/png"));
})();
