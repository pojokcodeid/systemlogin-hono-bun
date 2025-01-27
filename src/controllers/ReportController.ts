import { Context } from "hono";
import UserModel from "../models/UserModel";
import Flash from "../utils/Flash";
import Template from "../utils/Template";
import puppeteer from "puppeteer";

class ReportController {
  public getReportUser = async (c: Context) => {
    const { message, type } = Flash.getFlashData(c);
    const data = await UserModel.getAllUsers();
    const html = await Template(
      c,
      "report/user",
      {
        message: message,
        data: data,
        type,
        title: "Report",
      },
      false
    );
    const pdfPath = "public/pdf/list_user.pdf"; // Nama file PDF output

    try {
      // Luncurkan browser Puppeteer
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Masukkan HTML langsung ke dalam halaman
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      // Simpan halaman sebagai PDF
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
      });

      console.log(`PDF berhasil disimpan ke: ${pdfPath}`);

      // Tutup browser
      await browser.close();
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    }
    const key = "list_user.pdf";
    const url = new URL(c.req.url);
    const protocol = url.protocol;
    const host = c.req.header("host");
    const fullurl = `${protocol}//${host}/public/pdf/${key}`;
    return c.html(
      await Template(c, "report/open", {
        message: message,
        data: data,
        type,
        title: "Report",
        pdfPath: fullurl,
      })
    );
  };
}

export default new ReportController();
