export interface Language {
    id: number;
    code: string;
    name: string;
    native_name?: string;
}

export interface Currency {
    id: number;
    code: string;
    name: string;
    symbol?: string;
}

export interface LanguagePairDTO {
    id?: number;
    language_from: Language;
    language_to: Language;
    price_per_word?: number | null;
    price_per_hour?: number | null;
    currency: Currency;
}

export interface SpecializationOption {
    id: number;
    slug: string;
    title: string;
}

export interface SpecializationWithMeta extends SpecializationOption {
    rate?: number | null;
    currency?: Currency | null;
    note?: string | null;
}

export interface PortfolioItemDTO {
    id: number;
    title: string;
    description: string;
    file: string;
    created_at: string;
}

export interface TranslatorProfileDTO {
    id: number;
    full_name: string;
    experience_years: number;
    education: string;
    hourly_rate: string;
    currency: Currency | null;
    bio: string;
    language_pairs: LanguagePairDTO[];
    specializations: SpecializationWithMeta[];
    portfolio_items: PortfolioItemDTO[];
    avg_rating_cached: string | number | null;
    completed_orders_count: number;
    email_enabled: boolean;
    push_enabled: boolean;
}

export interface LanguageFormState {
    id: string;
    language_from_id: number | null;
    language_to_id: number | null;
    price_per_word: number | null;
    price_per_hour: number | null;
    currency_id: number | null;
}

export interface SpecializationMetaState {
    rate?: string;
    currency_id?: number | null;
    note?: string;
}

export type SpecializationMetaMap = Record<number, SpecializationMetaState>;

