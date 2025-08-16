import { createContext } from "react";
import type { UserInfo } from "@waline/api";
import { atom } from "jotai";
import z from "zod";

export const userInfoSchema = z.object({
  display_name: z.string(),
  email: z.string(),
  url: z.string(),
  token: z.string(),
  avatar: z.string(),
  mailMd5: z.string(),
  objectId: z.number(),
  type: z.enum(["administrator", "guest"]),
});
export const USER_KEY = "WALINE_USER";

const userInfoAtom = atom<UserInfo | null>(null);

userInfoAtom.onMount = (set) => {
  try {
    const storageItem =
      sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (storageItem) {
      try {
        set(z.union([userInfoSchema, z.null()]).parse(JSON.parse(storageItem)));
      } catch {
        // remove if storage is invalid
        sessionStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  } catch {}
};

const userInfoWithStorageAtom = atom(
  (get) => {
    return get(userInfoAtom);
  },
  (_, set, data: UserInfo | null, remember: boolean = true) => {
    const parsedData = z.union([userInfoSchema, z.null()]).safeParse(data);
    if (!parsedData.success) {
      return;
    }
    if (remember) {
      localStorage.setItem(USER_KEY, JSON.stringify(parsedData.data));
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(parsedData.data));
      localStorage.removeItem(USER_KEY);
    }
    set(userInfoAtom, parsedData.data);
  },
);
export { userInfoWithStorageAtom as userInfoAtom };

type YulineConfig = {
  serverURL: string;
  lang: string;
  url: string;
  ua: string;
};

export const YulineContext = createContext<YulineConfig>({
  serverURL: "",
  lang: "zh-CN",
  url: "",
  ua: "",
});
