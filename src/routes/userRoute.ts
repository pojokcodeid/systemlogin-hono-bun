import { Hono } from "hono";
import UserController from "../controllers/UserController";

const userRoute = new Hono();

userRoute.get("/register", UserController.openRegisterForm);
userRoute.get("/forgot", UserController.openForgotForm);
userRoute.get("/login", UserController.openLogin);
userRoute.get("/logout", UserController.logoutUser);
userRoute.post("/register", UserController.addUser);
userRoute.post("/login", UserController.loginUser);
userRoute.post("/forgot", UserController.forgotPassword);
userRoute.get("/reset/:key", UserController.openReset);
userRoute.post("/reset/:key", UserController.resetPassword);

export default userRoute;
