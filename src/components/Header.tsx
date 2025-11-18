import { useState } from "react";
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
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { useAuthStore } from "../stores/authStore";
import { useChatNotificationStore } from "../stores/chatNotificationsStore";

const NAV = [
    { label: "Каталог", to: "/search" },
];

const APPBAR_H = 72;

export default function Header() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const isReady = useAuthStore((state) => state.isReady);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const totalUnread = useChatNotificationStore((state) => state.totalUnread);

    const isAuthenticated = Boolean(user);
    const isClient = user?.role === "client";
    const isTranslator = user?.role === "translator";

    const chatsPath = isClient ? "/chats" : "/translator/chats";

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleLogout = () => {
        handleCloseMenu();
        logout();
        navigate("/");
    };

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                color="default"
                sx={{
                    height: APPBAR_H,
                    backgroundColor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Toolbar disableGutters sx={{ minHeight: APPBAR_H }}>
                    <Container sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {/* Логотип */}
                        <Link
                            component={RouterLink}
                            to="/"
                            underline="none"
                            sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                        >
                            <Box
                                sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: "linear-gradient(135deg,#FF4D2E,#FF8A65)",
                                }}
                            />
                            <Typography variant="h6" fontWeight={900} letterSpacing={-0.4} color="text.primary">
                                LEXORA
                            </Typography>
                        </Link>

                        {/* Навигация и действия - все справа */}
                        {isReady && (
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                                {/* Навигация */}
                                {NAV.map((n) => (
                                    <Link
                                        key={n.to}
                                        component={RouterLink}
                                        to={n.to}
                                        underline="none"
                                        sx={{
                                            fontWeight: 600,
                                            color: pathname === n.to ? "primary.main" : "text.primary",
                                            "&:hover": { color: "primary.main" },
                                        }}
                                    >
                                        {n.label}
                                    </Link>
                                ))}

                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            component={RouterLink}
                                            to="/login"
                                            underline="none"
                                            sx={{
                                                fontWeight: 600,
                                                color: "text.primary",
                                                "&:hover": { color: "primary.main" },
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            <LoginRoundedIcon fontSize="small" />
                                            Войти
                                        </Link>
                                        <Button variant="contained" component={RouterLink} to="/register" startIcon={<PersonAddAltRoundedIcon />}>
                                            Регистрация
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            component={RouterLink}
                                            to={chatsPath}
                                            underline="none"
                                            sx={{
                                                fontWeight: 600,
                                                color: pathname === chatsPath ? "primary.main" : "text.primary",
                                                "&:hover": { color: "primary.main" },
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                position: "relative",
                                            }}
                                        >
                                            <Badge
                                                color="primary"
                                                max={99}
                                                badgeContent={totalUnread}
                                                invisible={!totalUnread}
                                                overlap="circular"
                                                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                                sx={{
                                                    "& .MuiBadge-badge": {
                                                        fontSize: 11,
                                                    },
                                                }}
                                            >
                                                <ChatBubbleOutlineRoundedIcon fontSize="small" />
                                            </Badge>
                                            Чаты
                                        </Link>
                                        {isClient && (
                                            <Link
                                                component={RouterLink}
                                                to="/post-job"
                                                underline="none"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: pathname === "/post-job" ? "primary.main" : "text.primary",
                                                    "&:hover": { color: "primary.main" },
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <PostAddRoundedIcon fontSize="small" />
                                                Разместить заказ
                                            </Link>
                                        )}
                                        <Link
                                            component="button"
                                            onClick={(event) => setMenuAnchor(event.currentTarget)}
                                            underline="none"
                                            sx={{
                                                fontWeight: 600,
                                                color: "text.primary",
                                                "&:hover": { color: "primary.main" },
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                border: "none",
                                                background: "none",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                fontSize: "inherit",
                                            }}
                                        >
                                            <AccountCircleRoundedIcon fontSize="small" />
                                            Профиль
                                        </Link>
                                        <Menu
                                            anchorEl={menuAnchor}
                                            open={Boolean(menuAnchor)}
                                            onClose={handleCloseMenu}
                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                                        >
                                            {isTranslator && (
                                                <MenuItem
                                                    onClick={() => {
                                                        handleCloseMenu();
                                                        navigate("/translator/settings");
                                                    }}
                                                >
                                                    <SettingsRoundedIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                    Настройки профиля
                                                </MenuItem>
                                            )}
                                            <Divider />
                                            <MenuItem onClick={handleLogout}>
                                                <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.5 }} />
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
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 280 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={800}>
                        Меню
                    </Typography>
                    <IconButton onClick={() => setOpen(false)} color="inherit">
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>
                <Divider />
                <List sx={{ py: 1 }}>
                    {NAV.map((item) => (
                        <ListItem key={item.to} disableGutters>
                            <Link
                                component={RouterLink}
                                to={item.to}
                                underline="none"
                                onClick={() => setOpen(false)}
                                sx={{
                                    width: "100%",
                                    px: 2,
                                    py: 1.5,
                                    fontWeight: 600,
                                    color: pathname === item.to ? "primary.main" : "text.primary",
                                    "&:hover": { backgroundColor: "action.hover" },
                                }}
                            >
                                {item.label}
                            </Link>
                        </ListItem>
                    ))}
                    {isReady && (
                        <>
                            <Divider sx={{ my: 1 }} />
                            {!isAuthenticated ? (
                                <Box sx={{ px: 2, py: 1 }}>
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
                                </Box>
                            ) : (
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Stack spacing={1}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            component={RouterLink}
                                            to={chatsPath}
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
                                        {isClient && (
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
                                        )}
                                        {isTranslator && (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                component={RouterLink}
                                                to="/translator/settings"
                                                startIcon={<SettingsRoundedIcon />}
                                                onClick={() => setOpen(false)}
                                            >
                                                Настройки профиля
                                            </Button>
                                        )}
                                        <Button
                                            fullWidth
                                            variant="text"
                                            color="error"
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
                                </Box>
                            )}
                        </>
                    )}
                </List>
            </Drawer>
        </>
    );
}
