import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";

export interface PageAccessSettingAttributes {
  id: number;
  page_route: string;
  page_name: string;
  public_access: boolean;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PageAccessSettingCreationAttributes
  extends Optional<PageAccessSettingAttributes, "id" | "description" | "created_at" | "updated_at"> {}

class PageAccessSetting
  extends Model<PageAccessSettingAttributes, PageAccessSettingCreationAttributes>
  implements PageAccessSettingAttributes
{
  declare id: number;
  declare page_route: string;
  declare page_name: string;
  declare public_access: boolean;
  declare description?: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

PageAccessSetting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    page_route: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    page_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    public_access: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // created_at: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: DataTypes.NOW,
    // },
    // updated_at: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: DataTypes.NOW,
    // },
  },
  {
    sequelize,
    tableName: "page_access_settings",
    timestamps: true,
    underscored: true,
  }
);

export default PageAccessSetting;
