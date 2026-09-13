"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LANG } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const LangContext = createContext<Lang>(DEFAULT_LANG);

export const LangProvider = LangContext.Provider;

/** The active language. Read by `Txt` and by any component building an attribute string. */
export const useLang = (): Lang => useContext(LangContext);
