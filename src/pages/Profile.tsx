import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, CircularProgress, Container, Paper, Stack, Typography } from "@mui/material";

import { useAuthStore } from "../stores/authStore";
import { useTranslatorProfile } from "../hooks/useTranslatorProfile";
import { useProfileChat } from "../hooks/useProfileChat";
import {
    formatHourly,
    formatLanguagePair,
    getInitials,
} from "../utils/profile";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { LanguagesSection } from "../components/profile/LanguagesSection";
import { SpecializationsSection } from "../components/profile/SpecializationsSection";
import { PortfolioSection } from "../components/profile/PortfolioSection";
import { StatsSection } from "../components/profile/StatsSection";
import { ProfileChatDrawer } from "../components/profile/ProfileChatDrawer";
import ReviewsList from "../components/ReviewsList";

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);

    const { profile, isLoading, error, reloadProfile } = useTranslatorProfile(id);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const translatorProfileId = profile?.id ?? null;

    const {
        messages,
        messageDraft,
        setMessageDraft,
        chatLoading,
        historyLoading,
        chatError,
        isSending,
        openChat,
        closeChat,
        sendMessage,
    } = useProfileChat({
        translatorProfileId: translatorProfileId ?? 0,
        accessToken,
        userId: user?.id,
        isOpen: isChatOpen && !!translatorProfileId,
    });

    // Автопрокрутка к последнему сообщению
    useEffect(() => {
        if (!isChatOpen) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatOpen]);

    const languages = profile?.langs ?? [];
    const specializations = profile?.specializations ?? [];
    const portfolioItems = profile?.portfolio_items ?? [];

    const stats = useMemo(() => {
        if (!profile) return [];
        const rating = Number(profile.avg_rating_cached ?? 0) || 0;
        return [
            {
                label: "Рейтинг",
                value: rating ? rating.toFixed(1) : "—",
                secondary: rating ? "на основе завершённых заказов" : undefined,
            },
            {
                label: "Завершено заказов",
                value: profile.completed_orders_count ?? 0,
            },
            {
                label: "Опыт",
                value: profile.experience_years ? `${profile.experience_years} лет` : "—",
                secondary: profile.education ? `Образование: ${profile.education}` : undefined,
            },
        ];
    }, [profile]);

    const ratingValue = Number(profile?.avg_rating_cached ?? 0) || 0;
    const hourlyRateLabel = profile ? formatHourly(profile.hourly_rate, profile.currency) : "—";
    const initials = getInitials(profile?.full_name);
    const isOwnProfile =
        user?.role === "translator" &&
        translatorProfileId &&
        (user.profile as { id?: number } | undefined)?.id === translatorProfileId;
    const canInitiateChat = !!user && (user.role === "client" || user.role === "admin");

    const chatButtonLabel = !user
        ? "Войти, чтобы написать"
        : isOwnProfile
          ? "Это ваш профиль"
          : canInitiateChat
            ? "Написать переводчику"
            : "Чат доступен клиентам";

    const chatButtonDisabled = Boolean(
        !profile ||
            isOwnProfile ||
            (user && !canInitiateChat) ||
            chatLoading ||
            historyLoading,
    );

    const handleOpenChat = async () => {
        if (!profile) return;

        if (!user) {
            navigate("/login", { state: { redirectTo: location.pathname } });
            return;
        }
        if (!canInitiateChat) {
            setIsChatOpen(true);
            return;
        }

        setIsChatOpen(true);
        await openChat();
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        closeChat();
    };

    if (isLoading && !profile) {
        return (
            <Container>
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "60vh", gap: 2, py: 6 }}>
                    <CircularProgress />
                    <Typography color="text.secondary">Загружаем профиль переводчика…</Typography>
                </Stack>
            </Container>
        );
    }

    if ((error && !profile) || !profile) {
        return (
            <Container>
                <Paper sx={{ p: 4, textAlign: "center", mt: 6 }}>
                    <Stack spacing={2} alignItems="center">
                        <Typography color="error">
                            {error ?? "Переводчик не найден"}
                        </Typography>
                        <Button variant="outlined" onClick={reloadProfile}>
                            Повторить попытку
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container>
            <Stack spacing={3.5} sx={{ py: 6 }}>
                <ProfileHeader
                    profile={profile}
                    ratingValue={ratingValue}
                    hourlyRateLabel={hourlyRateLabel}
                    initials={initials}
                    chatButtonLabel={chatButtonLabel}
                    chatButtonDisabled={chatButtonDisabled}
                    onOpenChat={handleOpenChat}
                    chatHint={
                        user && !canInitiateChat && !isOwnProfile
                            ? "Чат доступен только для аккаунтов клиентов."
                            : undefined
                    }
                />

                <LanguagesSection
                    languages={languages}
                    currency={profile.currency}
                    formatLanguagePair={formatLanguagePair}
                />

                <SpecializationsSection specializations={specializations} />

                <PortfolioSection portfolioItems={portfolioItems} />

                <StatsSection stats={stats} />

                <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Typography variant="h6" gutterBottom>
                        Отзывы
                    </Typography>
                    {translatorProfileId && (
                        <ReviewsList translatorId={translatorProfileId} />
                    )}
                </Paper>

                <ProfileChatDrawer
                    open={isChatOpen}
                    onClose={handleCloseChat}
                    translatorName={profile.full_name || "Без имени"}
                    messages={messages}
                    messageDraft={messageDraft}
                    onMessageDraftChange={setMessageDraft}
                    onSendMessage={sendMessage}
                    chatLoading={chatLoading}
                    historyLoading={historyLoading}
                    chatError={chatError}
                    isSending={isSending}
                    userId={user?.id}
                    bottomRef={bottomRef}
                />
            </Stack>
        </Container>
    );
}
