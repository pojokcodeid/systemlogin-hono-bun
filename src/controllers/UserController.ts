import { Context } from "hono";
import AccessValidation from "../utils/AccessValidation";
import Flash from "../utils/Flash";
import UserModel from "../models/UserModel";
import Template from "../utils/Template";
import Logger from "../utils/Logger";
import { deleteCookie } from "hono/cookie";
import {
  loginValidation,
  resetPasswordValidation,
  validateUser,
} from "../validations/userValidation";
import Email from "../utils/Email";

class UserController {
  /**
   * Menampilkan list user yang ada di database.
   * Hanya user dengan akses peran ADMIN yang dapat mengakses halaman ini.
   * Jika akses ditolak, maka akan diarahkan ke halaman "tidak diizinkan".
   * Mengambil pesan flash dan menampilkan template "user/list".
   *
   * @param c - Objek konteks berisi informasi permintaan dan respon.
   * @returns Respon HTML untuk halaman list user atau respon redirect.
   */
  getUsers = async (c: Context) => {
    if (!(await AccessValidation.acessFile(c, "ADMIN"))) {
      return c.redirect("/notallowed");
    }

    try {
      const { message, type } = Flash.getFlashData(c);
      const users = await UserModel.getAllUsers();
      const html = await Template(c, "user/list", {
        title: "User List",
        message,
        type,
        data: users,
      });
      return c.html(html);
    } catch (error: unknown) {
      Logger.error("controller/userController/getUsers: " + error);
      Flash.setFlash(c, "Something went wrong, please contact support");
      return c.redirect("/");
    }
  };

  /**
   * Menampilkan form untuk menambahkan user baru.
   * Memeriksa apakah user saat ini memiliki akses peran ADMIN.
   * Jika akses ditolak, maka akan diarahkan ke halaman "tidak diizinkan".
   * Mengambil pesan flash dan menampilkan template "user/add".
   *
   * @param c - Objek konteks berisi informasi permintaan dan respon.
   * @returns Respon HTML untuk form tambah user atau respon redirect.
   */
  openAddUserForm = async (c: Context) => {
    if (!(await AccessValidation.acessFile(c, "ADMIN"))) {
      return c.redirect("/notallowed");
    }

    const { message, data } = Flash.getFlashData(c);
    const html = await Template(c, "user/add", {
      title: "User Add",
      message,
      data,
    });
    return c.html(html);
  };

  addUser = async (c: Context) => {
    let data = {};
    try {
      data = await c.req.parseBody();
      const { name, email, password, role } = await validateUser.parse(data);
      // validasi email exists
      const user = await UserModel.getUserByEmail(email);
      if (user) {
        throw new Error("Email already exists");
      }
      data = await UserModel.createUser(name, email, password, role);
      Flash.setFlash(c, "User added successfully", "success");
      return c.redirect("/users/login");
    } catch (error: unknown) {
      Logger.error("controller/userController/addUser: " + error);
      if (error instanceof Error) {
        let message = error.message;
        try {
          message = JSON.parse(error.message)[0].message;
        } catch {
          message = error.message;
        }
        Flash.setFlash(c, message, "danger", { data });
        return c.redirect("/users/register");
      } else {
        Flash.setFlash(
          c,
          "Something went wrong, please contact support",
          "danger",
          {
            data,
          }
        );
        return c.redirect("/users/register");
      }
    }
  };

  openRegisterForm = async (c: Context) => {
    const { message, data } = Flash.getFlashData(c);
    const html = await Template(
      c,
      "user/register",
      {
        title: "User Register",
        message,
        data,
      },
      false
    );
    return c.html(html);
  };
  openForgotForm = async (c: Context) => {
    const { message, type, data } = Flash.getFlashData(c);
    const html = await Template(
      c,
      "user/forgot",
      {
        title: "User Forgot Password",
        message,
        type,
        data,
      },
      false
    );
    return c.html(html);
  };

  openLogin = async (c: Context) => {
    const { message, type, data } = Flash.getFlashData(c);
    const html = await Template(
      c,
      "user/login",
      {
        title: "Login",
        message: message,
        data: data,
        type,
      },
      false
    );
    return c.html(html);
  };

  logoutUser = async (c: Context) => {
    deleteCookie(c, "user");
    return c.redirect("/users/login");
  };

  loginUser = async (c: Context) => {
    const data = await c.req.parseBody();
    try {
      const { email, password } = await loginValidation.parse(data);
      const user = await UserModel.verifyUser(email, password);
      if (user) {
        AccessValidation.setLoginCookie(c, user);
        Flash.setFlash(c, "Login successfully", "success", { data: user });
        return c.redirect("/");
      }
      Flash.setFlash(c, "Login failed", "danger", { data });
      return c.redirect("/users/login");
    } catch (error: unknown) {
      Logger.error("controller/userController/loginUser: " + error);
      if (error instanceof Error) {
        let message = error.message;
        try {
          message = JSON.parse(error.message)[0].message;
        } catch {
          message = error.message;
        }
        Flash.setFlash(c, message, "danger", { data });
        return c.redirect("/users/login");
      } else {
        Flash.setFlash(
          c,
          "Something went wrong, please contact support",
          "danger",
          {
            data,
          }
        );
        return c.redirect("/users/login");
      }
    }
  };

  forgotPassword = async (c: Context) => {
    // config cek link
    // https://mailmeteor.com/blog/gmail-smtp-settings
    // follow link config
    // https://myaccount.google.com/apppasswords
    const { email } = await c.req.parseBody();
    // Validasi input
    if (!email) {
      Flash.setFlash(c, "Email is required", "danger", { data: {} });
      return c.redirect("/users/forgot");
    }

    try {
      // Kirim email
      const result = await Email.sendEmail(c, email.toString());
      if (result.data == null) {
        Flash.setFlash(c, "Send email failed", "danger", { data: {} });
        return c.redirect("/users/forgot");
      }
      Flash.setFlash(c, "Reset success, please check your email!", "success", {
        data: result,
      });
      return c.redirect("/users/forgot");
    } catch (error) {
      console.error(error);
      Flash.setFlash(c, "Send email failed", "danger", { data: {} });
      return c.redirect("/users/forgot");
    }
  };

  openReset = async (c: Context) => {
    const { key } = c.req.param();
    try {
      const user = await UserModel.getUserReset(key);
      if (!user) {
        Flash.setFlash(c, "User reset not found", "danger", { data: {} });
        return c.redirect("/users/login");
      }
      const { message, type, data } = Flash.getFlashData(c);
      const dataFinal = { ...data, key };
      const html = await Template(
        c,
        "user/reset",
        {
          title: "Reset Password",
          message: message,
          data: dataFinal,
          type,
        },
        false
      );
      return c.html(html);
    } catch (error: unknown) {
      Logger.error("controller/userController/openReset: " + error);
      Flash.setFlash(c, "Something went wrong, please contact support");
      return c.redirect("/users/login");
    }
  };

  resetPassword = async (c: Context) => {
    const { key } = c.req.param();
    const data = await c.req.parseBody();
    try {
      const { password } = await resetPasswordValidation.parse(data);
      const user = await UserModel.getUserReset(key);
      if (!user) {
        Flash.setFlash(c, "User reset not found", "danger", { data: {} });
        return c.redirect("/users/login");
      }
      await UserModel.resetPassword(user.id, password);
      Flash.setFlash(c, "Password reset successfully", "success", { data: {} });
      return c.redirect("/users/login");
    } catch (error: unknown) {
      Logger.error("controller/userController/resetPassword: " + error);
      if (error instanceof Error) {
        let message = error.message;
        try {
          message = JSON.parse(error.message)[0].message;
        } catch {
          message = error.message;
        }
        Flash.setFlash(c, message, "danger", { data });
        return c.redirect(`/users/reset/${key}`);
      } else {
        Flash.setFlash(
          c,
          "Something went wrong, please contact support",
          "danger",
          {
            data,
          }
        );
        return c.redirect(`/users/reset/${key}`);
      }
    }
  };
}

export default new UserController();
