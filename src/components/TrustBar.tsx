import * as React from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
        <Paper sx={{ overflow: "hidden" }}>
            <Grid container sx={{ alignItems: "stretch" }}>
                {ITEMS.map((it, idx) => {
                    // xs: 2x2
                    const isRightColXs = idx % 2 === 1; // 1,3
                    const isBottomRowXs = idx >= 2;     // 2,3

                    // md: 1x4
                    const hasLeftDividerMd = idx !== 0;

                    return (
                        <Grid
                            key={it.label}
                            size={{ xs: 6, md: 3 }}
                            sx={(theme) => ({
                                position: "relative",
                                display: "flex",
                                // разделители:
                                borderTop: isBottomRowXs ? `1px solid ${theme.palette.divider}` : "none",
                                borderLeft: isRightColXs ? `1px solid ${theme.palette.divider}` : "none",
                                [theme.breakpoints.up("md")]: {
                                    borderTop: "none",
                                    borderLeft: hasLeftDividerMd ? `1px solid ${theme.palette.divider}` : "none",
                                },
                            })}
                        >
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={{ xs: 1, md: 1.75 }}
                                alignItems="center"
                                justifyContent="center"
                                sx={{
                                    width: "100%",
                                    px: { xs: 1.25, sm: 2, md: 2.5 },
                                    py: { xs: 1.75, sm: 2, md: 2.25 },
                                    textAlign: { xs: "center", md: "left" },
                                }}
                            >
                                <Box
                                    aria-hidden
                                    sx={(theme) => ({
                                        width: { xs: 42, md: 46 },
                                        height: { xs: 42, md: 46 },
                                        borderRadius: 2,
                                        display: "grid",
                                        placeItems: "center",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: "primary.main",
                                        lineHeight: 0,
                                        "& svg": { fontSize: { xs: 22, md: 24 }, display: "block" },
                                    })}
                                >
                                    {it.icon}
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            lineHeight: 1,
                                            letterSpacing: -0.6,
                                            fontSize: { xs: 26, sm: 28, md: 32 }, // крупно на ПК
                                        }}
                                    >
                                        {it.value}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.25,
                                            lineHeight: 1.25,
                                            fontSize: { xs: 13, md: 14 },
                                        }}
                                    >
                                        {it.label}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
}
