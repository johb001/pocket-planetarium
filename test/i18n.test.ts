import { describe, expect, test, beforeEach } from "vitest";
import { detectLocale, loadLocale, saveLocale, toggleLocale } from "../src/i18n/locale";
import { messages } from "../src/i18n/messages";

describe("i18n locale handling", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("keeps Chinese and English message keys in sync", () => {
    expect(Object.keys(messages.zh).sort()).toEqual(Object.keys(messages.en).sort());
  });

  test("detects Chinese browser languages", () => {
    expect(detectLocale(["zh-CN", "en-US"])).toBe("zh");
  });

  test("defaults unsupported browser languages to English", () => {
    expect(detectLocale(["fr-FR", "ja-JP"])).toBe("en");
  });

  test("loads saved locale before browser locale", () => {
    saveLocale("zh");

    expect(loadLocale(["en-US"])).toBe("zh");
  });

  test("toggles between supported locales", () => {
    expect(toggleLocale("zh")).toBe("en");
    expect(toggleLocale("en")).toBe("zh");
  });
});
