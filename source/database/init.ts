import { DatabaseConfigDevelopment } from "@configs/database.development";
import { DatabaseConfigDistribute } from "@configs/database.distribute";

import { DataSource } from "typeorm";

const mysqlDataSource = new DataSource(process.env.NODE_ENV === 'development' ? DatabaseConfigDevelopment : DatabaseConfigDistribute)
const mysqlManager = mysqlDataSource.manager
const mysqlIsInitilized = mysqlDataSource.isInitialized

const dataBaseConfigName = process.env.NODE_ENV === 'development' ? 'DatabaseConfigDevelopment' : 'DatabaseConfigDistribute'

export { mysqlDataSource, mysqlManager, mysqlIsInitilized, dataBaseConfigName }