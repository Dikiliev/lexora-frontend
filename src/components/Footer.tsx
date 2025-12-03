import * as React from "react";
import { Box, Container, Divider, Link, Stack, Typography, Grid } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

type FooterProps = { hideTopBorder?: boolean };
type FooterLink = { label: string; to: string; isAnchor?: boolean };

const footerColumns: Array<{ title: string; links: FooterLink[] }> = [
    {
        title: "Заказчикам",
        links: [
            { label: "Найти переводчика", to: "/search" },
            { label: "Разместить заказ", to: "/post-job" },
            { label: "Как это работает", to: "/#how", isAnchor: true },
        ],
    },
    {
        title: "Переводчикам",
        links: [
            { label: "Стать переводчиком", to: "/register" },
            { label: "Настройки профиля", to: "/translator/settings" },
            { label: "FAQ", to: "/faq" },
        ],
    },
    {
        title: "Сервис",
        links: [{ label: "О нас", to: "/about" }],
    },
];

function splitAnchor(to: string) {
    const [pathRaw, hashRaw] = to.split("#");
    return { path: pathRaw && pathRaw.length ? pathRaw : "/", hash: (hashRaw ?? "").trim() };
}

export default function Footer({ hideTopBorder }: FooterProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const year = new Date().getFullYear();

    const scrollToId = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const headerOffset = 100;
        const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
        e.preventDefault();
        const { path, hash } = splitAnchor(to);

        if (location.pathname !== path) {
            navigate(to);
            return;
        }
        if (hash) scrollToId(hash);
    };

    const linkSx = {
        color: "text.secondary",
        textDecoration: "none",
        "&:hover": { color: "text.primary" },
    } as const;

    return (
        <Box
            component="footer"
            sx={{
                mt: { xs: 4, md: 8 },
                borderTop: hideTopBorder ? "none" : "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
                <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
                    {/* Лево: бренд/описание/контакты */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={1.25}>
                            <Typography sx={{ fontWeight: 800, letterSpacing: -0.2 }}>LEXORA</Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
                                Сервис подбора переводчиков под задачу: документы, встречи, онлайн-созвоны.
                            </Typography>

                            <Stack spacing={0.75} sx={{ pt: 0.5 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <EmailRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Link href="mailto:support@lexora.ru" underline="hover" sx={linkSx} variant="body2">
                                        support@lexora.ru
                                    </Link>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CallRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Link href="tel:+78001234567" underline="hover" sx={linkSx} variant="body2">
                                        +7 (800) 123-45-67
                                    </Link>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <AccessTimeRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Пн–Пт 9:00–18:00 МСК
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* Право: навигация (на ПК всегда справа) */}
                    <Grid
                        size={{ xs: 12, md: 7 }}
                        sx={{
                            display: "flex",
                            justifyContent: { xs: "flex-start", md: "flex-end" },
                        }}
                    >
                        <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                            <Grid container spacing={{ xs: 2, md: 4 }}>
                                {footerColumns.map((col, idx) => (
                                    <Grid
                                        key={col.title}
                                        size={{ xs: idx === 2 ? 12 : 6, md: 4 }}
                                        sx={{ minWidth: { md: 180 } }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                            {col.title}
                                        </Typography>

                                        <Stack spacing={0.5}>
                                            {col.links.map((l) =>
                                                l.isAnchor ? (
                                                    <Link
                                                        key={l.label}
                                                        href={l.to}
                                                        onClick={(e) => handleAnchorClick(e, l.to)}
                                                        variant="body2"
                                                        underline="none"
                                                        sx={linkSx}
                                                    >
                                                        {l.label}
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        key={l.label}
                                                        component={RouterLink}
                                                        to={l.to}
                                                        variant="body2"
                                                        underline="none"
                                                        sx={linkSx}
                                                    >
                                                        {l.label}
                                                    </Link>
                                                ),
                                            )}
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                {/* Низ */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        gap: 1,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © {year} LEXORA. Все права защищены.
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2, rowGap: 0.5 }}>
                        <Link component={RouterLink} to="/terms" variant="body2" underline="none" sx={linkSx}>
                            Пользовательское соглашение
                        </Link>
                        <Link component={RouterLink} to="/privacy" variant="body2" underline="none" sx={linkSx}>
                            Политика конфиденциальности
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
