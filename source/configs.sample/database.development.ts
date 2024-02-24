import { DataSourceOptions } from "typeorm";

export const DatabaseConfigDevelopment: DataSourceOptions = {
    type: "mysql",
    host: "HOST_YOUR_DATABASE_SERVER", // localhost - if it runs on a local computer
    port: 3306, // default port mysql
    username: "USERNAME_YOUR_DATABASE_SERVER",
    password: "PASSWORD_FROM_USER_YOUR_DATABASE_SERVER",
    database: "DATABASE_NAME_YOUR",
    entities: [__dirname + "/../entity/*{.ts,.js}"],
    synchronize: true,
}