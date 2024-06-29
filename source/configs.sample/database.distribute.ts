import { DataSourceOptions } from "typeorm";

export const DatabaseConfigDistribute: DataSourceOptions = {
    type: "mysql",
    host: "tbt_database",
    port: 3306,
    username: "telegrambottasks",
    password: "orc8lUA7WA9bJgMZgy53OaqpjRPfPCIMDUUJ4CF1",
    database: "telegrambottasks",
    entities: [__dirname + "/../entity/*{.ts,.js}"],
    synchronize: true,
}