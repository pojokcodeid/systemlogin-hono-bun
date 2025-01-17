import { Context } from "hono";
import AccessValidation from "./AccessValidation";
import { readFile } from "fs/promises";
import ejs from "ejs";

/**
 * Class untuk mengatur template view
 */
class Template {
  private async getTemplate(template: string) {
    if (template === "") return "";
    return readFile(`./src/views/${template}.ejs`, "utf-8");
  }

  /**
   * Method untuk menampilkan template
   * @class
   * @classdesc Method ini digunakan untuk mengatur template view, seperti header, footer, dan navigasi.
   */
  public setTemplate = async (
    c: Context,
    template: string,
    data: object,
    isMenu = true // jika ingin menu muncul set true default true
  ) => {
    let navPath = ""; // declare navPath here
    if (AccessValidation.getLoginCookie(c)) {
      const user = JSON.parse(AccessValidation.getLoginCookie(c) ?? "");
      navPath =
        user && user.role === "ADMIN" ? "partials/nav_admin" : "partials/nav";
    }

    const [header, nav, fotter, templateContent] = await Promise.all([
      this.getTemplate("partials/header"),
      this.getTemplate(navPath),
      this.getTemplate("partials/fotter"),
      this.getTemplate(template),
    ]);

    let html = ejs.render(header + nav + templateContent + fotter, data);
    if (!isMenu) {
      html = ejs.render(header + templateContent + fotter, data);
    }
    return html;
  };
}

export default new Template().setTemplate;
