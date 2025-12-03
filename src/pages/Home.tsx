import { Box, Button, Container, Grid, IconButton, Stack, Typography } from "@mui/material";
import TranslateIcon from '@mui/icons-material/Translate';
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SectionHeading from "../components/SectionHeading";
import TrustBar from "../components/TrustBar";
import HowItWorks from "../components/HowItWorks";
import DomainsPanel from "../components/DomainsPanel";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";

export default function Home() {
    const nav = useNavigate();
    const location = useLocation();

    const attemptsRef = useRef(0);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            attemptsRef.current = 0;
            const maxAttempts = 10;
            const scrollToElement = () => {
                attemptsRef.current++;
                const element = document.getElementById(id);
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                } else if (attemptsRef.current < maxAttempts) {
                    // Если элемент еще не найден, пробуем еще раз через небольшую задержку
                    setTimeout(scrollToElement, 50);
                }
            };
            // Задержка для рендеринга контента, особенно при переходе с других страниц
            const timeoutId = setTimeout(scrollToElement, 200);
            return () => clearTimeout(timeoutId);
        }
    }, [location.hash, location.pathname]);

    return (
        <Box>
            {/* ===== HERO (как было, адаптировано под сервис) ===== */}
            <Box
                sx={{
                    pt: { xs: 6, md: 8 },
                    pb: { xs: 8, md: 10 },
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(60% 60% at 120% 20%, rgba(255,77,46,0.06) 0%, transparent 60%), radial-gradient(50% 40% at -10% 60%, rgba(255,77,46,0.05) 0%, transparent 70%)",
                        pointerEvents: "none",
                    },
                }}
            >
                <Container>
                    <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Stack spacing={3}>
                                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 1 }}>
                                    Сервис поиска переводчиков
                                </Typography>

                                <Typography variant="h1" sx={{ lineHeight: 1.05 }}>
                                    Найдите профессионального <br />
                                    переводчика <Box component="span" sx={{ color: "primary.main" }}>за минуты</Box>
                                </Typography>

                                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700 }}>
                                    Подбор по языковым парам, доменам (медицина, финансы, IT), ставке и опыту.
                                </Typography>

                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForwardRoundedIcon />}
                                        onClick={() => nav("/search")}
                                    >
                                        Начать поиск
                                    </Button>
                                    {/*<Stack direction="row" spacing={1}>*/}
                                    {/*    <IconButton aria-label="Pairs" color="inherit" title="200+ языковых пар">*/}
                                    {/*        <LanguageRoundedIcon />*/}
                                    {/*    </IconButton>*/}
                                    {/*    <IconButton aria-label="Verified" color="inherit" title="Проверенные специалисты">*/}
                                    {/*        <ShieldRoundedIcon />*/}
                                    {/*    </IconButton>*/}
                                    {/*    <IconButton aria-label="Fast" color="inherit" title="Быстрый старт">*/}
                                    {/*        <TimerRoundedIcon />*/}
                                    {/*    </IconButton>*/}
                                    {/*</Stack>*/}
                                </Stack>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box
                                sx={{
                                    position: "relative",
                                    height: { xs: 360, md: 480 },
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: { xs: 24, md: 10 },
                                        right: { xs: "50%", md: 24 },
                                        transform: { xs: "translateX(50%)", md: "none" },
                                        width: { xs: 260, md: 360 },
                                        height: { xs: 260, md: 360 },
                                        borderRadius: "50%",
                                        background: "radial-gradient(60% 60% at 40% 35%, #FF795F 0%, #FF4D2E 60%, #E74229 100%)",
                                        filter: "drop-shadow(0 14px 36px rgba(255,77,46,.35))",
                                        zIndex: 0,
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: "relative",
                                        zIndex: 1,
                                        width: { xs: 180, md: 220 },
                                        height: { xs: 180, md: 220 },
                                        borderRadius: "50%",
                                        bgcolor: "#fff",
                                        border: "1px solid #E6E8EC",
                                        display: "grid",
                                        placeItems: "center",
                                        boxShadow: "0 16px 40px rgba(10,11,13,.08)",
                                    }}
                                >
                                    <TranslateIcon color={'primary'} sx={{ fontSize: { xs: 72, md: 96 } }} />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ===== TRUST BAR (доверие и метрики) ===== */}
            <Container sx={{ mt: -4, pb: { xs: 4, md: 6 } }}>
                <TrustBar />
            </Container>

            <Container sx={{ mt: 4 }}>
                <HowItWorks />
            </Container>

            {/* ===== DOMAINS (тематики) ===== */}
            <Container sx={{ mt: 3, mb: 3 }}>
                <DomainsPanel />
            </Container>

            {/* ===== TESTIMONIALS ===== */}
            <Container sx={{ py: { xs: 6, md: 8 } }}>
                <SectionHeading title="Отзывы" subtitle="Реальные кейсы от компаний и специалистов." />
                <Box sx={{ mt: 2 }}>
                    <Testimonials />
                </Box>
            </Container>

            {/* ===== CTA ===== */}
            <Container sx={{ pb: { xs: 10, md: 12 } }}>
                <CTA />
            </Container>
        </Box>
    );
}
