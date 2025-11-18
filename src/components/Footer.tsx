import { Box, Container, Stack, Typography, Link, useTheme } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

type FooterProps = {
    /** Можно отключить верхнюю границу, если футер стоит прямо под секцией с бордером */
    hideTopBorder?: boolean;
};

const footerColumns = [
    {
        title: "Заказчикам",
        links: [
            { label: "Найти переводчика", to: "/search", isAnchor: false },
            { label: "Разместить заказ", to: "/post-job", isAnchor: false },
            { label: "Как это работает", to: "/#how", isAnchor: true },
        ],
    },
    {
        title: "Переводчикам",
        links: [
            { label: "Стать переводчиком", to: "/register", isAnchor: false },
            { label: "Настройки профиля", to: "/translator/settings", isAnchor: false },
            { label: "FAQ", to: "/faq", isAnchor: false },
        ],
    },
    {
        title: "Сервис",
        links: [
            { label: "О нас", to: "/about", isAnchor: false },
        ],
    },
];

const Footer: React.FC<FooterProps> = ({ hideTopBorder }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string, isAnchor: boolean) => {
        if (isAnchor) {
            e.preventDefault();
            const [path, hash] = to.split("#");
            if (location.pathname !== path) {
                // Переходим на другую страницу с якорем
                navigate(to);
            } else {
                // Уже на нужной странице, скроллим к элементу
                const element = document.getElementById(hash);
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }
        }
    };

    return (
        <Box
            component="footer"
            sx={{
                mt: { xs: 6, md: 10 },
                borderTop: hideTopBorder ? "none" : "1px solid",
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper,
            }}
        >
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                {/* Верхняя часть: брендинг + колонки ссылок */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 4, md: 8 }}
                    justifyContent="space-between"
                >
                    {/* Бренд и описание */}
                    <Stack spacing={2} maxWidth={360}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 2,
                                    background: "linear-gradient(135deg,#FF4D2E,#FF8A65)",
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 900,
                                    letterSpacing: -0.4,
                                }}
                            >
                                LEXORA
                            </Typography>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            Сервис подбора профессиональных переводчиков под ваши задачи: документы, встречи,
                            онлайн-созвоны и многое другое.
                        </Typography>
                    </Stack>

                    {/* Колонки навигации */}
                    <Stack direction="row" spacing={{ xs: 4, md: 6 }} flexWrap="wrap">
                        {footerColumns.map((column) => (
                            <Box key={column.title} sx={{ minWidth: 140 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    {column.title}
                                </Typography>
                                <Stack spacing={0.5}>
                                    {column.links.map((link) => (
                                        <Link
                                            key={link.label}
                                            component={link.isAnchor ? "a" : RouterLink}
                                            href={link.isAnchor ? link.to : undefined}
                                            to={link.isAnchor ? undefined : link.to}
                                            variant="body2"
                                            color="text.secondary"
                                            underline="none"
                                            onClick={(e) => handleLinkClick(e, link.to, link.isAnchor)}
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    color: "text.primary",
                                                },
                                            }}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Stack>

                {/* Нижняя плашка: копирайт + легал + контакты */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    mt={{ xs: 4, md: 6 }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                >
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            © {new Date().getFullYear()} LEXORA. Все права защищены.
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Email:{" "}
                                <Link href="mailto:support@lexora.ru" color="primary" underline="hover">
                                    support@lexora.ru
                                </Link>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Телефон:{" "}
                                <Link href="tel:+78001234567" color="primary" underline="hover">
                                    +7 (800) 123-45-67
                                </Link>
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Время работы: Пн-Пт, 9:00 — 18:00 МСК
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Link
                            component={RouterLink}
                            to="/terms"
                            variant="body2"
                            color="text.secondary"
                            underline="none"
                            sx={{ "&:hover": { color: "text.primary" } }}
                        >
                            Пользовательское соглашение
                        </Link>
                        <Link
                            component={RouterLink}
                            to="/privacy"
                            variant="body2"
                            color="text.secondary"
                            underline="none"
                            sx={{ "&:hover": { color: "text.primary" } }}
                        >
                            Политика конфиденциальности
                        </Link>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default Footer;

