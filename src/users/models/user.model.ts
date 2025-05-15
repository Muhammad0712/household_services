import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IUserCreationAttr {
  name: string;
  phone: string;
  email: string;
  hashed_password: string;
  location: string;
  activation_link: string;
}

@Table({ tableName: "users", timestamps: false })
export class User extends Model<User, IUserCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(15),
    unique: true,
    allowNull: false,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
  })
  declare hashed_password: string;

  @Column({
    type: DataType.STRING,
  })
  declare hashed_refresh_token: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_active: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_owner: boolean;

  @Column({
    type: DataType.STRING,
  })
  declare location: string;

  @Column({
    type: DataType.TEXT,
    defaultValue: DataType.UUIDV4,
  })
  declare activation_link: string;
}
