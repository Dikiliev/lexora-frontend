import { Box, Paper, Stack, Typography } from "@mui/material";

interface Stat {
    label: string;
    value: string | number;
    secondary?: string;
}

interface StatsSectionProps {
    stats: Stat[];
}

export function StatsSection({ stats }: StatsSectionProps) {
    return (
        <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
                Показатели
            </Typography>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ mt: 1 }}
            >
                {stats.map((stat) => (
                    <Box
                        key={stat.label}
                        sx={{
                            flex: 1,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            p: 2,
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            {stat.label}
                        </Typography>
                        <Typography variant="h5">{stat.value}</Typography>
                        {stat.secondary && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {stat.secondary}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
}

