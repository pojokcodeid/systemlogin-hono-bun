import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

class AccessValidation {
  /**
   * Klas ini berisi fungsi-fungsi untuk validasi dan pengelolaan akses user.
   *
   * @class AccessValidation
   */
  public static setLoginCookie = (c: Context, obj: object) => {
    setCookie(c, "user", JSON.stringify({ ...obj }), {
      path: "/",
      httpOnly: true, // Keamanan tambahan
      maxAge: 86400, // Flash message berlaku selama 1 hari
    });
  };

  /**
   * Menetapkan cookie login pengguna.
   *
   * @param c - Konteks permintaan
   * @param obj - Objek data pengguna yang akan disimpan dalam cookie
   */
  public static getLoginCookie = (c: Context) => {
    const message = getCookie(c, "user");
    return message;
  };

  /**
   * Mengambil data pengguna yang tersimpan dalam cookie.
   *
   * @param c - Konteks permintaan
   * @returns Data pengguna yang tersimpan dalam cookie. Jika tidak ada data pengguna, maka akan mengembalikan `false`.
   */
  public static getUserLoginData = (c: Context) => {
    const user = this.getLoginCookie(c);
    if (user) {
      try {
        return JSON.parse(user);
      } catch {
        return false;
      }
    }
    return false;
  };

  /**
   * Memvalidasi status login pengguna.
   *
   * @param c - Konteks permintaan
   * @param next - Fungsi middleware yang akan dipanggil jika pengguna sudah login
   * @returns Mengarahkan ke halaman login jika pengguna belum login.
   */
  public static validateUserLogin = async (
    c: Context,
    next: () => Promise<void>
  ) => {
    const user = this.getLoginCookie(c);
    if (user) {
      await next();
    }
    return c.redirect("/users/login");
  };

  /**
   * Memeriksa akses file berdasarkan peran pengguna.
   *
   * @param c - Konteks permintaan
   * @param role - Peran yang diperlukan untuk mengakses file, default adalah "USER"
   * @returns `true` jika pengguna memiliki akses, `false` jika tidak.
   */
  public static acessFile = async (c: Context, role: string = "USER") => {
    const user = this.getLoginCookie(c);
    if (user) {
      const userObjeck = JSON.parse(user?.toString() || "");
      if (userObjeck.role != role) {
        return false;
      }
    }
    return true;
  };
}

export default AccessValidation;
