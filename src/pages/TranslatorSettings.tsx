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

export default function TranslatorSettings() {
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
            <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
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
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
            <Paper
                component="form"
                elevation={2}
                onSubmit={handleSubmit}
                sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, display: "grid", gap: 4 }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        Настройки профиля переводчика
                    </Typography>
                    <Typography color="text.secondary">
                        Заполните языковые пары, специализации и стоимость услуг, чтобы клиенты могли быстрее вас найти.
                    </Typography>
                </Box>

                <Feedback error={error} success={success} />

                <BasicsSection profile={profile} onFieldChange={updateProfileField} />
                <NotificationsSection profile={profile} onFieldChange={updateProfileField} />

                <Divider />

                <LanguagesSection
                    languages={languages}
                    onAdd={addLanguage}
                    onRemove={removeLanguage}
                    onChange={updateLanguage}
                    onCurrencyChange={updateLanguageCurrency}
                    fallbackCurrency={profile.currency}
                />

                <Divider />

                <SpecializationsSection
                    options={specializations}
                    selected={selectedSpecs}
                    meta={specMeta}
                    fallbackCurrency={profile.currency}
                    onSelectionChange={updateSpecializations}
                    onMetaChange={updateSpecMeta}
                />

                <Box display="flex" justifyContent="flex-end">
                    <Button variant="contained" size="large" type="submit" disabled={isSaving}>
                        {isSaving ? "Сохраняем..." : "Сохранить изменения"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

