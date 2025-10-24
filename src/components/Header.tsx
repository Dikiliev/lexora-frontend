import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
    AppBar,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    Link,
    List,
    ListItem,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const NAV = [
    { label: "Каталог", to: "/search" },
    { label: "Как это работает", to: "/#how" },
    { label: "Для переводчиков", to: "/#for-translators" },
    { label: "О сервисе", to: "/#about" },
];

const APPBAR_H = 72;         // высота
const FADE_DISTANCE = 120;   // за сколько px увести фон в прозрачность

export default function Header() {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [alpha, setAlpha] = useState(1); // 1 = белый фон, 0 = полностью прозрачно
    const raf = useRef<number | null>(null);

    // плавный fade: при скролле уменьшаем альфу белого фона и усиливаем blur
    useEffect(() => {
        const onScroll = () => {
            if (raf.current) cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(() => {
                const y = window.scrollY || 0;
                const p = Math.min(1, Math.max(0, y / FADE_DISTANCE));
                setAlpha(1 - p);
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            if (raf.current) cancelAnimationFrame(raf.current);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    // стили навигационных ссылок
    const linkSx = {
        fontWeight: 700,
        letterSpacing: 0.2,
        color: "inherit",
        "&:hover": { textDecoration: "underline" },
        position: "relative",
        "&.active::after": {
            content: '""',
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "primary.main",
            marginLeft: 1,
            verticalAlign: "middle",
        },
    } as const;

    // вычислим blur и тень от прогресса
    const blurPx = (1 - alpha) * 24;
    const bgColor = `rgba(255,255,255,${alpha.toFixed(3)})`;

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                color="default"
                sx={{
                    height: APPBAR_H,
                    justifyContent: "center",
                    // старт: белый, скроллим — делаем прозрачным и добавляем blur
                    backgroundColor: bgColor,
                    backdropFilter: `saturate(${1 + (1 - alpha) * 0.1}) blur(${blurPx}px)`,
                    WebkitBackdropFilter: `saturate(${1 + (1 - alpha) * 0.1}) blur(${blurPx}px)`,
                    transition:
                        "background-color .25s ease, border-color .25s ease, box-shadow .25s ease, backdrop-filter .25s ease, -webkit-backdrop-filter .25s ease",
                    color: "text.primary",
                }}
            >
                <Toolbar disableGutters sx={{ minHeight: APPBAR_H }}>
                    <Container sx={{ display: "flex", alignItems: "center" }}>
                        {/* Логотип */}
                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
                            <Box
                                sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: "linear-gradient(135deg,#FF4D2E,#FF8A65)",
                                }}
                            />
                            <Typography variant="h6" fontWeight={900} letterSpacing={-0.4}>
                                LEXORA
                            </Typography>
                        </Stack>

                        {/* Навигация — только текстовые ссылки */}
                        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                            {NAV.map((n) => (
                                <Link
                                    key={n.to}
                                    component={RouterLink}
                                    to={n.to}
                                    underline="none"
                                    sx={linkSx}
                                    className={pathname === n.to ? "active" : undefined}
                                >
                                    {n.label}
                                </Link>
                            ))}
                        </Stack>

                        {/* Бургер (мобилка) */}
                        <IconButton
                            onClick={() => setOpen(true)}
                            sx={{ display: { xs: "inline-flex", md: "none" }, color: "inherit" }}
                        >
                            <MenuRoundedIcon />
                        </IconButton>
                    </Container>
                </Toolbar>
            </AppBar>

            {/* spacer под fixed AppBar */}
            <Toolbar sx={{ minHeight: APPBAR_H }} />

            {/* Мобильное меню */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: 300, backgroundColor: "#FFFFFF", borderLeft: "1px solid #E6E8EC" } }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={800}>Навигация</Typography>
                    <IconButton onClick={() => setOpen(false)} color="inherit">
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>
                <Divider />
                <List>
                    {NAV.map((item) => (
                        <ListItem key={item.to} disableGutters sx={{ px: 2, py: 1 }}>
                            <Link
                                component={RouterLink}
                                to={item.to}
                                underline="none"
                                color="inherit"
                                onClick={() => setOpen(false)}
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    width: "100%",
                                    py: 1,
                                    px: 1.5,
                                    borderRadius: 1.5,
                                    "&:hover": { backgroundColor: "rgba(0,0,0,.04)" },
                                }}
                            >
                                {item.label}
                            </Link>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
}
