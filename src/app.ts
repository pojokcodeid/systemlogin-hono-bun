import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import userRoute from "./routes/userRoute";
import AccessValidation from "./utils/AccessValidation";
import HomeController from "./controllers/HomeController";
import reportRoute from "./routes/reportRoute";

const app = new Hono();

// Middleware untuk melayani file statis
app.use("/public/*", serveStatic({ root: "./" }));
app.route("/users", userRoute);
app.route("/report", reportRoute);

app.get("/", AccessValidation.validateUserLogin, HomeController.getHome);
app.get("/notallowed", HomeController.notAllowed);
app.get(
  "/acessfile",
  AccessValidation.validateUserLogin,
  HomeController.exampleAcess
);

export default app;
