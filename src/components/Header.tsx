import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
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
    Menu,
    MenuItem,
    Stack,
    Button,
    Toolbar,
    Typography,
} from "@mui/material";
import Badge from "@mui/material/Badge";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useAuthStore } from "../stores/authStore";
import { useChatNotificationStore } from "../stores/chatNotificationsStore";

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
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alpha, setAlpha] = useState(1); // 1 = белый фон, 0 = полностью прозрачно
    const raf = useRef<number | null>(null);
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const isReady = useAuthStore((state) => state.isReady);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const totalUnread = useChatNotificationStore((state) => state.totalUnread);

    const isAuthenticated = Boolean(user);
    
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
                    border: 'none',
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

                        {isReady && (
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                                {!isAuthenticated ? (
                                    <>
                                        <Button
                                            variant="text"
                                            color="inherit"
                                            component={RouterLink}
                                            to="/login"
                                            startIcon={<LoginRoundedIcon />}
                                        >
                                            Войти
                                        </Button>
                                        <Button
                                            variant="contained"
                                            component={RouterLink}
                                            to="/register"
                                            startIcon={<PersonAddAltRoundedIcon />}
                                        >
                                            Регистрация
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {user?.role === "client" && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={
                                                        <Badge
                                                            color="error"
                                                            max={99}
                                                            badgeContent={totalUnread}
                                                            invisible={!totalUnread}
                                                            overlap="circular"
                                                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                                            sx={{
                                                                "& .MuiBadge-badge": {
                                                                    fontSize: 10,
                                                                    height: 18,
                                                                    minWidth: 18,
                                                                    px: 0.5,
                                                                },
                                                            }}
                                                        >
                                                            <ChatBubbleOutlineRoundedIcon />
                                                        </Badge>
                                                    }
                                                    component={RouterLink}
                                                    to="/chats"
                                                >
                                                    Чаты
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<PostAddRoundedIcon />}
                                                    component={RouterLink}
                                                    to="/post-job"
                                                >
                                                    Разместить заказ
                                                </Button>
                                            </>
                                        )}
                                        {user?.role === "translator" && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={
                                                        <Badge
                                                            color="error"
                                                            max={99}
                                                            badgeContent={totalUnread}
                                                            invisible={!totalUnread}
                                                            overlap="circular"
                                                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                                            sx={{
                                                                "& .MuiBadge-badge": {
                                                                    fontSize: 10,
                                                                    height: 18,
                                                                    minWidth: 18,
                                                                    px: 0.5,
                                                                },
                                                            }}
                                                        >
                                                            <ChatBubbleOutlineRoundedIcon />
                                                        </Badge>
                                                    }
                                                    component={RouterLink}
                                                    to="/translator/chats"
                                                >
                                                    Чаты
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    component={RouterLink}
                                                    to="/translator/settings"
                                                >
                                                    Профиль
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant="text"
                                            color="inherit"
                                            startIcon={<AccountCircleRoundedIcon />}
                                            onClick={(event) => setMenuAnchor(event.currentTarget)}
                                        >
                                            {user?.email || "Профиль"}
                                        </Button>
                                        <Menu
                                            anchorEl={menuAnchor}
                                            open={Boolean(menuAnchor)}
                                            onClose={() => setMenuAnchor(null)}
                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                                        >
                                            {user?.role === "client" && (
                                                <MenuItem
                                                    onClick={() => {
                                                        setMenuAnchor(null);
                                                        navigate("/chats");
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        justifyContent="space-between"
                                                        sx={{ width: "100%" }}
                                                    >
                                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                                            <ChatBubbleOutlineRoundedIcon fontSize="small" />
                                                            <Typography variant="inherit">Чаты</Typography>
                                                        </Stack>
                                                        {totalUnread > 0 && (
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    backgroundColor: "primary.main",
                                                                    color: "primary.contrastText",
                                                                    borderRadius: 10,
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                    lineHeight: 1,
                                                                    px: 1,
                                                                    py: 0.25,
                                                                    minWidth: 28,
                                                                    textAlign: "center",
                                                                }}
                                                            >
                                                                {totalUnread > 99 ? "99+" : totalUnread}
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </MenuItem>
                                            )}
                                            {user?.role === "client" && (
                                                <MenuItem
                                                    onClick={() => {
                                                        setMenuAnchor(null);
                                                        navigate("/post-job");
                                                    }}
                                                >
                                                    <PostAddRoundedIcon fontSize="small" style={{ marginRight: 12 }} />
                                                    Разместить заказ
                                                </MenuItem>
                                            )}
                                            {user?.role === "translator" && (
                                                <MenuItem
                                                    onClick={() => {
                                                        setMenuAnchor(null);
                                                        navigate("/translator/chats");
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        justifyContent="space-between"
                                                        sx={{ width: "100%" }}
                                                    >
                                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                                            <ChatBubbleOutlineRoundedIcon fontSize="small" />
                                                            <Typography variant="inherit">Чаты</Typography>
                                                        </Stack>
                                                        {totalUnread > 0 && (
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    backgroundColor: "primary.main",
                                                                    color: "primary.contrastText",
                                                                    borderRadius: 10,
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                    lineHeight: 1,
                                                                    px: 1,
                                                                    py: 0.25,
                                                                    minWidth: 28,
                                                                    textAlign: "center",
                                                                }}
                                                            >
                                                                {totalUnread > 99 ? "99+" : totalUnread}
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </MenuItem>
                                            )}
                                            {user?.role === "translator" && (
                                                <MenuItem
                                                    onClick={() => {
                                                        setMenuAnchor(null);
                                                        navigate("/translator/settings");
                                                    }}
                                                >
                                                    <AccountCircleRoundedIcon fontSize="small" style={{ marginRight: 12 }} />
                                                    Настройки профиля
                                                </MenuItem>
                                            )}
                                            <MenuItem
                                                onClick={() => {
                                                    setMenuAnchor(null);
                                                    logout();
                                                    navigate("/");
                                                }}
                                            >
                                                <LogoutRoundedIcon fontSize="small" style={{ marginRight: 12 }} />
                                                Выйти
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}
                            </Stack>
                        )}

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
                    {isReady && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ px: 2, display: { xs: "block", md: "none" } }}>
                                {!isAuthenticated ? (
                                    <Stack spacing={1}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            component={RouterLink}
                                            to="/login"
                                            startIcon={<LoginRoundedIcon />}
                                            onClick={() => setOpen(false)}
                                        >
                                            Войти
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            component={RouterLink}
                                            to="/register"
                                            startIcon={<PersonAddAltRoundedIcon />}
                                            onClick={() => setOpen(false)}
                                        >
                                            Регистрация
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1}>
                                        {user?.role === "client" && (
                                            <>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    component={RouterLink}
                                                    to="/chats"
                                                    startIcon={
                                                        <Badge
                                                            color="error"
                                                            max={99}
                                                            badgeContent={totalUnread}
                                                            invisible={!totalUnread}
                                                            overlap="circular"
                                                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                                            sx={{
                                                                "& .MuiBadge-badge": {
                                                                    fontSize: 10,
                                                                    height: 18,
                                                                    minWidth: 18,
                                                                    px: 0.5,
                                                                },
                                                            }}
                                                        >
                                                            <ChatBubbleOutlineRoundedIcon />
                                                        </Badge>
                                                    }
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Чаты
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    component={RouterLink}
                                                    to="/post-job"
                                                    startIcon={<PostAddRoundedIcon />}
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Разместить заказ
                                                </Button>
                                            </>
                                        )}
                                        {user?.role === "translator" && (
                                            <>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    component={RouterLink}
                                                    to="/translator/chats"
                                                    startIcon={
                                                        <Badge
                                                            color="error"
                                                            max={99}
                                                            badgeContent={totalUnread}
                                                            invisible={!totalUnread}
                                                            overlap="circular"
                                                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                                            sx={{
                                                                "& .MuiBadge-badge": {
                                                                    fontSize: 10,
                                                                    height: 18,
                                                                    minWidth: 18,
                                                                    px: 0.5,
                                                                },
                                                            }}
                                                        >
                                                            <ChatBubbleOutlineRoundedIcon />
                                                        </Badge>
                                                    }
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Чаты
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    component={RouterLink}
                                                    to="/translator/settings"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Настройки профиля
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            fullWidth
                                            variant="text"
                                            color="inherit"
                                            startIcon={<LogoutRoundedIcon />}
                                            onClick={() => {
                                                logout();
                                                setOpen(false);
                                                navigate("/");
                                            }}
                                        >
                                            Выйти
                                        </Button>
                                    </Stack>
                                )}
                            </Box>
                        </>
                    )}
                </List>
            </Drawer>
        </>
    );
}
