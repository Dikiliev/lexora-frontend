import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import { useLanguages } from "../../hooks/useLanguages";
import { useCurrencies } from "../../hooks/useCurrencies";
import type {
    Currency,
    Language,
    LanguageFormState,
    LanguagePairDTO,
    SpecializationMetaMap,
    SpecializationOption,
    SpecializationWithMeta,
    TranslatorProfileDTO,
} from "./types";

interface UseTranslatorSettingsFormOptions {
    onAfterSubmit?: () => Promise<void> | void;
}

interface SubmitPayload {
    full_name: string;
    experience_years: number;
    education: string;
    hourly_rate: string;
    currency_id: number | null;
    bio: string;
    email_enabled: boolean;
    push_enabled: boolean;
    language_pairs: Array<{
        language_from_id: number;
        language_to_id: number;
        price_per_word: number | null;
        price_per_hour: number | null;
        currency_id: number;
    }>;
    specializations: Array<{
        id: number;
        rate: number | null;
        currency_id: number | null;
        note: string;
    }>;
}

export function useTranslatorSettingsForm(options: UseTranslatorSettingsFormOptions = {}) {
    const [profile, setProfile] = useState<TranslatorProfileDTO | null>(null);
    const [languages, setLanguages] = useState<LanguageFormState[]>([]);
    const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
    const [selectedSpecIds, setSelectedSpecIds] = useState<number[]>([]);
    const [specMeta, setSpecMeta] = useState<SpecializationMetaMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { languages: availableLanguages } = useLanguages();
    const { currencies } = useCurrencies();
    const fetchUser = useAuthStore((state) => state.fetchUser);

    const buildLanguagesState = useCallback(
        (items: LanguagePairDTO[], currencyFallback: Currency | null): LanguageFormState[] => {
            return (items ?? []).map((item, index) => ({
                id: `${index}`,
                language_from_id: item.language_from?.id ?? null,
                language_to_id: item.language_to?.id ?? null,
                price_per_word: item.price_per_word ?? null,
                price_per_hour: item.price_per_hour ?? null,
                currency_id: item.currency?.id ?? currencyFallback?.id ?? null,
            }));
        },
        [],
    );

    const buildSpecMetaState = useCallback(
        (items: SpecializationWithMeta[] | undefined, currencyFallback: Currency | null): SpecializationMetaMap => {
            if (!items?.length) return {};
            return items.reduce<SpecializationMetaMap>((acc, spec) => {
                acc[spec.id] = {
                    rate: spec.rate != null ? String(spec.rate) : "",
                    currency_id: spec.currency?.id ?? currencyFallback?.id ?? null,
                    note: spec.note ?? "",
                };
                return acc;
            }, {});
        },
        [],
    );

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profileResponse, specializationResponse] = await Promise.all([
                request<TranslatorProfileDTO>("/translators/me/"),
                request<{ results?: SpecializationOption[] } | SpecializationOption[]>("/specializations/"),
            ]);

            const specializationList = Array.isArray(specializationResponse)
                ? specializationResponse
                : specializationResponse.results ?? [];

            setProfile(profileResponse);
            setLanguages(buildLanguagesState(profileResponse.language_pairs ?? [], profileResponse.currency));
            setSpecializations(specializationList);
            setSelectedSpecIds((profileResponse.specializations ?? []).map((item) => item.id));
            setSpecMeta(buildSpecMetaState(profileResponse.specializations, profileResponse.currency));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Не удалось загрузить профиль";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [buildLanguagesState, buildSpecMetaState]);

    useEffect(() => {
        void load();
    }, [load]);

    const updateProfileField = useCallback(<K extends keyof TranslatorProfileDTO>(field: K, value: TranslatorProfileDTO[K]) => {
        setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
    }, []);

    const addLanguage = useCallback(() => {
        setLanguages((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                language_from_id: null,
                language_to_id: null,
                price_per_word: null,
                price_per_hour: null,
                currency_id: profile?.currency?.id ?? currencies[0]?.id ?? null,
            },
        ]);
    }, [profile?.currency, currencies]);

    const updateLanguage = useCallback(
        (id: string, field: keyof LanguageFormState, value: string | number | null) => {
            setLanguages((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              [field]:
                                  field === "price_per_hour" || field === "price_per_word"
                                      ? value === "" || value === null
                                          ? null
                                          : Number(value)
                                      : field === "language_from_id" || field === "language_to_id" || field === "currency_id"
                                        ? value === "" || value === null
                                            ? null
                                            : Number(value)
                                        : value,
                          }
                        : item,
                ),
            );
        },
        [],
    );

    const updateLanguageCurrency = useCallback((id: string, value: number | null) => {
        setLanguages((prev) => prev.map((item) => (item.id === id ? { ...item, currency_id: value } : item)));
    }, []);

    const removeLanguage = useCallback((id: string) => {
        setLanguages((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const updateSpecializations = useCallback(
        (items: SpecializationOption[]) => {
            setSelectedSpecIds(items.map((item) => item.id));
            setSpecMeta((prev) => {
                const next: SpecializationMetaMap = {};
                items.forEach((item) => {
                    next[item.id] = prev[item.id] ?? {
                        rate: "",
                        currency_id: profile?.currency?.id ?? currencies[0]?.id ?? null,
                        note: "",
                    };
                });
                return next;
            });
        },
        [profile?.currency, currencies],
    );

    const updateSpecMeta = useCallback(
        (id: number, field: "rate" | "currency_id" | "note", value: string | number | null) => {
            setSpecMeta((prev) => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: field === "currency_id" ? (value === "" || value === null ? null : Number(value)) : value,
                },
            }));
        },
        [],
    );

    const resetFeedback = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    const buildSubmitPayload = useCallback((): SubmitPayload | null => {
        if (!profile) return null;

        return {
            full_name: profile.full_name,
            experience_years: profile.experience_years,
            education: profile.education,
            hourly_rate: profile.hourly_rate,
            currency_id: profile.currency?.id ?? null,
            bio: profile.bio,
            email_enabled: profile.email_enabled,
            push_enabled: profile.push_enabled,
            language_pairs: languages
                .filter((lang) => lang.language_from_id && lang.language_to_id && lang.currency_id)
                .map(({ id, ...lang }) => ({
                    language_from_id: lang.language_from_id!,
                    language_to_id: lang.language_to_id!,
                    price_per_word: lang.price_per_word,
                    price_per_hour: lang.price_per_hour,
                    currency_id: lang.currency_id!,
                })),
            specializations: selectedSpecIds.map((id) => ({
                id,
                rate: specMeta[id]?.rate ? Number(specMeta[id]?.rate) : null,
                currency_id: specMeta[id]?.currency_id ?? profile.currency?.id ?? null,
                note: specMeta[id]?.note ?? "",
            })),
        };
    }, [languages, profile, selectedSpecIds, specMeta]);

    const submit = useCallback(async () => {
        const payload = buildSubmitPayload();
        if (!payload) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await request("/translators/me/", { method: "PATCH", json: payload });
            await fetchUser();
            if (options.onAfterSubmit) {
                await options.onAfterSubmit();
            }
            setSuccess("Профиль успешно обновлен");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Не удалось сохранить профиль";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    }, [buildSubmitPayload, fetchUser, options]);

    const selectedSpecs = useMemo(
        () => specializations.filter((spec) => selectedSpecIds.includes(spec.id)),
        [selectedSpecIds, specializations],
    );

    return {
        state: {
            profile,
            languages,
            specializations,
            selectedSpecIds,
            selectedSpecs,
            specMeta,
            isLoading,
            isSaving,
            error,
            success,
        },
        handlers: {
            load,
            updateProfileField,
            addLanguage,
            updateLanguage,
            updateLanguageCurrency,
            removeLanguage,
            updateSpecializations,
            updateSpecMeta,
            resetFeedback,
            submit,
        },
    };
}

