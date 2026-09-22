"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "ar" | "en";
export type Theme = "dark" | "light";

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (ar: string, en: string) => string;
  isRtl: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "ar",
  setLocale: () => {},
  t: (ar) => ar,
  isRtl: true,
  theme: "dark",
  toggleTheme: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load persisted choices
    const savedLocale = localStorage.getItem("rakaiz_locale") as Locale;
    if (savedLocale === "ar" || savedLocale === "en") {
      setLocaleState(savedLocale);
    }

    const savedTheme = localStorage.getItem("rakaiz_theme_v2") as Theme;
    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeState(savedTheme);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("rakaiz_locale", locale);
  }, [locale, ready]);

  useEffect(() => {
    if (!ready) return;
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light-mode");
    }
    localStorage.setItem("rakaiz_theme_v2", theme);
  }, [theme, ready]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const t = (ar: string, en: string) => {
    return locale === "ar" ? ar : en;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isRtl: locale === "ar",
        theme,
        toggleTheme,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
