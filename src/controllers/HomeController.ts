import { Context } from "hono";
import Template from "../utils/Template";
import Flash from "../utils/Flash";
import AccessValidation from "../utils/AccessValidation";

class HomeController {
  public getHome = async (c: Context) => {
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

  public notAllowed = async (c: Context) => {
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

  public exampleAcess = async (c: Context) => {
    const acessFile = await AccessValidation.acessFile(c, "ADMIN");
    if (acessFile) {
      // tampilkan halaman yang ingin di berikan
      return c.html(
        "<html><head><title>Access Allowed</title></head><body><h1>Access Allowed</h1></body></html>"
      );
    }
    return c.redirect("/notallowed");
  };
}

export default new HomeController();
