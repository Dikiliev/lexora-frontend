import { makeAutoObservable } from "mobx";
import type { Translator } from "../types";
import { filterStore } from "./filterStore";

class TranslatorsStore {
    list: Translator[] = [
        { id: "1", name: "Anna Petrova", fromLang: "Английский", toLang: "Русский", categories: ["Медицина","Наука"], rate: 1800, rating: 4.9, verified: true },
        { id: "2", name: "Kenji Sato", fromLang: "Японский", toLang: "Английский", categories: ["Игры","IT"], rate: 2400, rating: 4.8 },
        { id: "3", name: "María Gómez", fromLang: "Испанский", toLang: "Португальский", categories: ["Маркетинг"], rate: 1500, rating: 4.7 },
        { id: "4", name: "Ivan Ivanov", fromLang: "Немецкий", toLang: "Русский", categories: ["Юриспруденция","Финансы"], rate: 2600, rating: 4.85, verified: true },
    ];

    constructor() { makeAutoObservable(this); }

    get filtered() {
        const f = filterStore;
        return this.list.filter((t) => {
            const byFrom = !f.fromLang || t.fromLang === f.fromLang;
            const byTo = !f.toLang || t.toLang === f.toLang;
            const byRate = t.rate >= f.rateRange[0] && t.rate <= f.rateRange[1];
            const byCats = f.categories.length === 0 || f.categories.every((c) => t.categories.includes(c));
            return byFrom && byTo && byRate && byCats;
        });
    }
}

export const translatorsStore = new TranslatorsStore();
