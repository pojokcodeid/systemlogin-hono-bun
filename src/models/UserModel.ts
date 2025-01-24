import { PrismaClient, Role, User } from "@prisma/client";

class UserModel {
  private prisma = new PrismaClient();

  public getAllUsers = async (): Promise<User[]> =>
    this.prisma.user
      .findMany()
      .then((users) =>
        users.map((user) => ({ ...user, password: "********" }))
      );

  public getUserById = async (id: number): Promise<User | null> =>
    this.prisma.user
      .findUnique({ where: { id } })
      .then((user) => (user ? { ...user, password: "" } : null));

  public getUserByEmail = async (email: string): Promise<User | null> =>
    this.prisma.user.findUnique({ where: { email } });

  public createUser = async (
    name: string,
    email: string,
    password: string,
    role: Role = "USER"
  ): Promise<User> =>
    this.prisma.user.create({
      data: {
        name,
        email,
        password: await this.hashPassword(password),
        role,
      },
    });

  public updateUser = async (
    id: number,
    name: string,
    email: string,
    password: string | undefined,
    role: Role = "USER",
    forgot: string
  ): Promise<User | null> =>
    this.prisma.user
      .update({
        where: { id },
        data: {
          name,
          email,
          role,
          password: password ? await this.hashPassword(password) : undefined,
          forgot,
        },
      })
      .then((user) => (user ? { ...user, password: "********" } : null));

  public  deleteUser = async (id: number): Promise<boolean> =>
    this.prisma.user
      .delete({ where: { id } })
      .then(() => true)
      .catch(() => false);

  public verifyUser = async (email: string, password: string): Promise<User | null> =>
    this.getUserByEmail(email).then(async (user) => {
      if (user && (await this.comparePassword(password, user.password))) {
        return { ...user, password: "********" };
      }
      return null;
    });

  public getUserReset = async (key: string): Promise<User | null> =>
    this.prisma.user.findFirst({ where: { forgot: key } });

  public resetPassword = async (id: number, password: string): Promise<User | null> =>
    this.prisma.user
      .update({
        where: { id },
        data: { password: await this.hashPassword(password), forgot: null },
      })
      .then((user) => (user ? { ...user, password: "********" } : null));

  private hashPassword = async (password: string): Promise<string> =>
    Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });

  private comparePassword = async (
    password: string,
    hashedPassword: string
  ): Promise<boolean> => Bun.password.verify(password, hashedPassword);
}

export default new UserModel();
