import type { LanguagePairDTO } from "../pages/translator-settings/types";

export function parseNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isNaN(numeric) ? null : numeric;
}

export function formatMoney(value: string | number | null | undefined, currency: string): string {
    const numeric = parseNumber(value);
    if (numeric === null) return "—";
    try {
        return new Intl.NumberFormat("ru-RU", { style: "currency", currency }).format(numeric);
    } catch {
        return `${numeric.toLocaleString("ru-RU")} ${currency}`;
    }
}

export function formatHourly(value: string | number | null | undefined, currency: string): string {
    const formatted = formatMoney(value, currency);
    return formatted === "—" ? formatted : `${formatted}/ч`;
}

export function formatLanguagePair(
    pair: LanguagePairDTO,
    fallbackCurrency: string,
): { pricePerWord: string; pricePerHour: string } {
    const pricePerWord = formatMoney(pair.price_per_word, pair.currency ?? fallbackCurrency);
    const pricePerHour = formatHourly(pair.price_per_hour, pair.currency ?? fallbackCurrency);
    return { pricePerWord, pricePerHour };
}

export function getInitials(name: string | null | undefined): string {
    if (!name) return "L";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "L";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "L";
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

