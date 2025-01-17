import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import userRoute from "./routes/userRoute";
import AccessValidation from "./utils/AccessValidation";
import HomeController from "./controllers/HomeController";

const app = new Hono();

// Middleware untuk melayani file statis
app.use("/public/*", serveStatic({ root: "./" }));
app.route("/users", userRoute);

app.get("/", AccessValidation.validateUserLogin, HomeController.getHome);

export default app;
