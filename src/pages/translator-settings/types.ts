export interface LanguagePairDTO {
    language_from: string;
    language_to: string;
    price_per_word?: number | null;
    price_per_hour?: number | null;
    currency?: string | null;
}

export interface SpecializationOption {
    id: number;
    slug: string;
    title: string;
}

export interface SpecializationWithMeta extends SpecializationOption {
    rate?: number | null;
    currency?: string | null;
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
    currency: string;
    bio: string;
    langs: LanguagePairDTO[];
    specializations: SpecializationWithMeta[];
    portfolio_items: PortfolioItemDTO[];
    avg_rating_cached: string | number | null;
    completed_orders_count: number;
    email_enabled: boolean;
    push_enabled: boolean;
}

export interface LanguageFormState extends LanguagePairDTO {
    id: string;
}

export interface SpecializationMetaState {
    rate?: string;
    currency?: string;
    note?: string;
}

export type SpecializationMetaMap = Record<number, SpecializationMetaState>;

