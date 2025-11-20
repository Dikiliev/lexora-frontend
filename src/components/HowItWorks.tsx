import * as React from "react";
import {
    Box,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
// поправь путь под свой проект
import SectionHeading from "../components/SectionHeading";

const STEPS = [
    {
        icon: <SearchRoundedIcon />,
        label: "Шаг 1",
        title: "Сформулируйте запрос",
        text: "Выберите языковую пару, тематику и формат: документы, созвон или встреча.",
    },
    {
        icon: <FilterAltRoundedIcon />,
        label: "Шаг 2",
        title: "Отфильтруйте кандидатов",
        text: "Задайте диапазон ставки, опыт, специализацию и получите релевантные профили.",
    },
    {
        icon: <AssignmentTurnedInRoundedIcon />,
        label: "Шаг 3",
        title: "Свяжитесь напрямую",
        text: "Напишите переводчику, обсудите детали и запускайте работу без посредников.",
    },
];

const HowItWorks: React.FC = () => {
    return (
        <Box
            id="how"
            component="section"
            sx={{
                scrollMarginTop: "100px",
            }}
        >
            <Container>
                <SectionHeading
                    title="Как это работает"
                    subtitle="Три шага от запроса до результата: задайте фильтры, получите точные совпадения, договоритесь напрямую."
                />

                <Grid
                    container
                    spacing={{ xs: 2.5, md: 3 }}
                    sx={{ mt: { xs: 3, md: 4 } }}
                >
                    {STEPS.map((step) => (
                        <Grid key={step.title} size={{xs: 12, md: 4}}>
                            <Paper
                                sx={{
                                    p: { xs: 2.5, md: 3 },
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.5,
                        
                                    transition:
                                        "border-color .14s ease, transform .14s ease, box-shadow .14s ease",
                                    "&:hover": {
                                        
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 10px 24px rgba(15,23,42,.08)",
                                    },
                                }}
                            >
                                {/* Верхняя строка: иконка + подпись шага */}
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            border: "1px solid",
                                            borderColor: "divider",
                                            display: "grid",
                                            placeItems: "center",
                                            "& svg": {
                                                fontSize: 22,
                                                color: "text.secondary",
                                            },
                                        }}
                                    >
                                        {step.icon}
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        {step.label}
                                    </Typography>
                                </Stack>

                                <Typography variant="h6">
                                    {step.title}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {step.text}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default HowItWorks;
