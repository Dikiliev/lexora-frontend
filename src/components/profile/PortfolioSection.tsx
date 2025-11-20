import { Link, Paper, Stack, Typography } from "@mui/material";
import type { PortfolioItemDTO } from "../../pages/translator-settings/types";

interface PortfolioSectionProps {
    portfolioItems: PortfolioItemDTO[];
}

export function PortfolioSection({ portfolioItems }: PortfolioSectionProps) {
    return (
        <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
                Портфолио
            </Typography>
            {portfolioItems.length === 0 ? (
                <Typography color="text.secondary">
                    Портфолио пока пустое.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {portfolioItems.map((item) => (
                        <Paper
                            key={item.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                            }}
                        >
                            <Stack spacing={1}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    {item.title}
                                </Typography>
                                {item.description && (
                                    <Typography color="text.secondary">
                                        {item.description}
                                    </Typography>
                                )}
                                <Link
                                    href={item.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Открыть файл
                                </Link>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}

