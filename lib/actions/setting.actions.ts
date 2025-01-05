"use server";
import { ISettingInput } from "@/types";
import data from "../data";
import Setting from "../db/models/setting.model";
import { connectToDatabase } from "../db";
import { formatError } from "../utils";
import { cookies } from "next/headers";

const globalForSettings = global as unknown as {
  cachedSettings: ISettingInput | null;
};
export const getNoCachedSetting = async (): Promise<ISettingInput> => {
  await connectToDatabase();
  const setting = await Setting.findOne();
  return JSON.parse(JSON.stringify(setting)) as ISettingInput;
};

export const getSetting = async (): Promise<ISettingInput> => {
  if (!globalForSettings.cachedSettings) {
    await connectToDatabase();
    const setting = await Setting.findOne().lean();
    globalForSettings.cachedSettings = setting
      ? JSON.parse(JSON.stringify(setting))
      : data.settings[0];
  }
  if(globalForSettings.cachedSettings){
    globalForSettings.cachedSettings.site.name="TimZone";
    globalForSettings.cachedSettings.site.slogan="Spend less, enjoy more.";
    globalForSettings.cachedSettings.site.description="Timzone is a sample Ecommerce website built with Next.js, Tailwind CSS, and MongoDB.";
    globalForSettings.cachedSettings.site.keywords="Next Ecommerce, Next.js, Tailwind CSS, MongoDB";
    globalForSettings.cachedSettings.site.email="admin@example.com";
    globalForSettings.cachedSettings.site.phone="+628121932483";
    globalForSettings.cachedSettings.site.author="TimZone";
    globalForSettings.cachedSettings.site.copyright="2024, TimZone.com";
    globalForSettings.cachedSettings.site.address="Indonesia";
  }
  return globalForSettings.cachedSettings as ISettingInput;
};

export const updateSetting = async (newSetting: ISettingInput) => {
  try {
    await connectToDatabase();
    const updatedSetting = await Setting.findOneAndUpdate({}, newSetting, {
      upsert: true,
      new: true,
    }).lean();
    globalForSettings.cachedSettings = JSON.parse(
      JSON.stringify(updatedSetting)
    ); // Update the cache
    return {
      success: true,
      message: "Setting updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

// Server action to update the currency cookie
export const setCurrencyOnServer = async (newCurrency: string) => {
  "use server";
  const cookiesStore = await cookies();
  cookiesStore.set("currency", newCurrency);

  return {
    success: true,
    message: "Currency updated successfully",
  };
};
