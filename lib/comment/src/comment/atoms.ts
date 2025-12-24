import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const SORT_BY_OPTIONS = ["created_desc", "created_asc"] as const;
export const SORT_BY_LABELS = {
  created_desc: "最新",
  created_asc: "最早",
} as const;
export const sortByAtom =
  atom<(typeof SORT_BY_OPTIONS)[number]>("created_desc");

export const persistentEmailAtom = atomWithStorage<string>(
  "persistentEmail",
  "",
);
export const persistentNameAtom = atomWithStorage<string>("persistentName", "");
export const persistentAsVisitorAtom = atomWithStorage<boolean>(
  "persistentAsVisitor",
  false,
);
