import { Hono } from "hono";
import ReportController from "../controllers/ReportController";

const reportRoute = new Hono();

reportRoute.get("/users", ReportController.getReportUser);

export default reportRoute;
