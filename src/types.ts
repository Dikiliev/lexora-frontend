export type Language = string;
export type Category = string;

export interface Translator {
    id: string;
    name: string;
    fromLang: Language;
    toLang: Language;
    categories: Category[];
    rate: number;   // ₽/час
    rating: number; // 0..5
    verified?: boolean;
    avatarUrl?: string;
    bio?: string;
}
