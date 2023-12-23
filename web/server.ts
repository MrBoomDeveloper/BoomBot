import { Express } from "express";
import { readFile } from "fs/promises";
import { parse as parseCookie } from "cookie";

export async function registerServerPaths(app: Express) {
	app.get("/admin", async (req, res) => {
		const cookies = parseCookie(req.headers.cookie);
		res.status(200);

		res.send(await readFile(((cookies["password"] == process.env.ADMIN_PANEL_PASSWORD)
			? "./web/admin.html"
			: "./web/login.html"), "utf-8"));
	});
}