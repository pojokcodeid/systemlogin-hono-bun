import { Context } from "hono";
import Template from "../utils/Template";
import Flash from "../utils/Flash";
import AccessValidation from "../utils/AccessValidation";

class HomeController {
  getHome = async (c: Context) => {
    const { message, type } = Flash.getFlashData(c);
    const data = AccessValidation.getUserLoginData(c);
    const html = await Template(c, "home", {
      message: message,
      data: data,
      type,
      title: "Home",
    });
    return c.html(html);
  };

  notAllowed = async (c: Context) => {
    const html = await Template(
      c,
      "notallowed",
      {
        message: "Access Denied",
        data: {},
        type: "danger",
        title: "Not Allowed",
      },
      false
    );
    return c.html(html);
  };
}

export default new HomeController();
