import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Typography,
} from "@mui/material";
import { BasicsSection } from "./translator-settings/components/BasicsSection";
import { LanguagesSection } from "./translator-settings/components/LanguagesSection";
import { SpecializationsSection } from "./translator-settings/components/SpecializationsSection";
import { NotificationsSection } from "./translator-settings/components/NotificationsSection";
import { Feedback } from "./translator-settings/components/Feedback";
import { useTranslatorSettingsForm } from "./translator-settings/useTranslatorSettingsForm";
import { useLanguages } from "../hooks/useLanguages";
import { useCurrencies } from "../hooks/useCurrencies";

export default function TranslatorSettings() {
    const { languages: availableLanguages } = useLanguages();
    const { currencies: availableCurrencies } = useCurrencies();
    
    const {
        state: {
            profile,
            languages,
            specializations,
            selectedSpecs,
            specMeta,
            isLoading,
            isSaving,
            error,
            success,
        },
        handlers: {
            submit,
            updateProfileField,
            addLanguage,
            updateLanguage,
            updateLanguageCurrency,
            removeLanguage,
            updateSpecializations,
            updateSpecMeta,
        },
    } = useTranslatorSettingsForm();

    if (isLoading && !profile) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="50vh"
                >
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
                <Typography color="error" align="center">
                    {error ?? "Профиль не найден"}
                </Typography>
            </Container>
        );
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        void submit();
    };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
            <Paper
                component="form"
                elevation={0}
                onSubmit={handleSubmit}
                sx={{
                    p: { xs: 2.5, md: 3.5 },
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    boxShadow: "0 18px 40px rgba(15,23,42,.06)",
                    borderColor: "divider",
                }}
            >
                {/* Заголовок */}
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Настройки профиля переводчика
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ mt: 0.75, maxWidth: 640 }}
                    >
                        Заполните языковые пары, специализации и ставки, чтобы
                        клиенты могли быстрее вас найти и оценить ваши услуги.
                    </Typography>
                </Box>

                {/* Общий фидбек */}
                <Feedback error={error} success={success} />

                {/* Базовая информация */}
                <BasicsSection
                    profile={profile}
                    availableCurrencies={availableCurrencies}
                    onFieldChange={updateProfileField}
                />

                {/* Уведомления */}
                <NotificationsSection
                    profile={profile}
                    onFieldChange={updateProfileField}
                />

                <Divider />

                {/* Языковые пары */}
                <LanguagesSection
                    languages={languages}
                    availableLanguages={availableLanguages}
                    availableCurrencies={availableCurrencies}
                    onAdd={addLanguage}
                    onRemove={removeLanguage}
                    onChange={updateLanguage}
                    onCurrencyChange={updateLanguageCurrency}
                    fallbackCurrencyId={profile.currency?.id ?? null}
                />

                <Divider />

                {/* Специализации */}
                <SpecializationsSection
                    options={specializations}
                    selected={selectedSpecs}
                    meta={specMeta}
                    availableCurrencies={availableCurrencies}
                    fallbackCurrencyId={profile.currency?.id ?? null}
                    onSelectionChange={updateSpecializations}
                    onMetaChange={updateSpecMeta}
                />

                {/* Кнопка сохранения */}
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    sx={{ pt: 1 }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={isSaving}
                        startIcon={
                            isSaving ? (
                                <CircularProgress size={16} thickness={4} />
                            ) : null
                        }
                    >
                        {isSaving ? "Сохраняем..." : "Сохранить изменения"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

