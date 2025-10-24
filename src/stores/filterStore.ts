import { makeAutoObservable } from "mobx";

class FilterStore {
    fromLang: string | null = "Английский";
    toLang: string | null = "Русский";
    categories: string[] = [];
    rateRange: number[] = [800, 3000];

    constructor() { makeAutoObservable(this); }

    setFrom(v: string | null) { this.fromLang = v; }
    setTo(v: string | null) { this.toLang = v; }
    toggleCategory(cat: string) {
        this.categories = this.categories.includes(cat)
            ? this.categories.filter((c) => c !== cat)
            : [...this.categories, cat];
    }
    setRate(v: number[]) { this.rateRange = v; }
    reset() {
        this.fromLang = null;
        this.toLang = null;
        this.categories = [];
        this.rateRange = [500, 4000];
    }
}

export const filterStore = new FilterStore();
export type FilterStoreType = FilterStore;
