import { Paper, Stack, Typography, Box, Grid } from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

type Item = { value: string; label: string; icon: React.ReactNode };

const ITEMS: Item[] = [
    { value: "24k", label: "проверенных переводчиков", icon: <ShieldRoundedIcon /> },
    { value: "200+", label: "языковых пар", icon: <LanguageRoundedIcon /> },
    { value: "98%", label: "заказов с повтором", icon: <RepeatRoundedIcon /> },
    { value: "~2ч", label: "среднее время отклика", icon: <AccessTimeRoundedIcon /> },
];

export default function TrustBar() {
    return (
        <Paper
            sx={{
                p: { xs: 1.5, md: 2 },
                overflow: "hidden",
            }}
        >
            <Grid container spacing={0}>
                {ITEMS.map((it, idx) => (
                    <Grid
                        key={it.label}
                        size={{ xs: 12, sm: 6, md: 3 }}
                        sx={{
                            borderLeft: { md: idx === 0 ? "0" : "1px solid #E6E8EC" },
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            justifyContent="center"
                            sx={{ py: { xs: 1.5, md: 2 } }}
                        >
                            <Box
                                aria-hidden
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: "#fff",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    boxShadow: "0 4px 12px rgba(10,11,13,.04)",

                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    lineHeight: 0,
                                    "& svg": {
                                        display: "block",
                                        fontSize: 22,
                                        transform: "translateY(1px)"
                                    },
                                }}
                            >
                                {it.icon}
                            </Box>


                            <Stack spacing={0.2} alignItems="flex-start">
                                <Typography variant="h4" fontWeight={800} lineHeight={1}>
                                    {it.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {it.label}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
}
