import nodemailer from "nodemailer";
import UserModel from "../models/UserModel";
import { PrismaClient } from "@prisma/client";
import { Context } from "hono";
class Email {
  private prisma;
  constructor() {
    this.prisma = new PrismaClient();
  }
  sendEmail = async (c: Context, to: string) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ACCOUNT, // Ganti dengan email Gmail Anda
        pass: process.env.EMAIL_PASSWORD, // Ganti dengan password aplikasi Gmail
      },
    });
    const subject = "Rest Password";
    const key = Bun.randomUUIDv7();
    const url = new URL(c.req.url);
    const protocol = url.protocol;
    const host = c.req.header("host");
    const fullurl = `${protocol}//${host}/users/reset/${key}`;
    const template = `
    Dear User,

    Here is the password reset link:
    ${fullurl}
    `;

    // Konfigurasi email
    const mailOptions = {
      from: process.env.ENAIL_SENDER,
      to,
      subject,
      text: template,
    };
    const user = await UserModel.getUserByEmail(to);
    if (user) {
      const userupdated = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          forgot: key,
        },
      });
      await transporter.sendMail(mailOptions);

      return {
        message: "Email sent successfully",
        data: { ...userupdated, password: "********" },
      };
    }
    return { message: "Email not found", data: null };
  };
}

export default new Email();
