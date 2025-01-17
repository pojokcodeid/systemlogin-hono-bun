import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

/**
 * Kelas untuk mengatur flash message dalam cookie
 */
class Flash {
  /**
   * Menyimpan flash message dalam cookie
   *
   * @param {Context} c - Context hono
   * @param {string} message - Pesan yang akan ditampilkan
   * @param {string} [type="danger"] - Tipe pesan, default "danger"
   * @param {object} [obj={}] - Data lain yang ingin disimpan dalam cookie
   */
  public static setFlash = (
    c: Context,
    message: string,
    type: string = "danger",
    obj: object = {}
  ) => {
    const data = { message, type, ...obj };
    setCookie(c, "flash", JSON.stringify(data), {
      path: "/",
      httpOnly: true, // Keamanan tambahan
      maxAge: 10, // Flash message berlaku selama 10 detik
    });
  };

  /**
   * Memanggil flash message dalam cookie
   *
   * @param {Context} c - Context hono
   * @returns {string | null} - Flash message dalam bentuk string, atau null jika tidak ada
   */
  public static getFlash = (c: Context): string | null => {
    const message = getCookie(c, "flash");
    if (message) {
      setCookie(c, "flash", "", { path: "/", maxAge: 0 }); // Hapus cookie setelah digunakan
    }
    return message ? message : null;
  };

  public static getFlashData(c: Context) {
    let message = undefined;
    let type = "danger";
    let data = {};
    const flashMessage = this.getFlash(c);
    if (flashMessage) {
      const out = JSON.parse(flashMessage);
      message = out.message;
      type = out.type;
      data = out.data;
    }
    return { message, type, data };
  }
}

export default Flash;
