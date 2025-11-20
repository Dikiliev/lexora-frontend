import { Chip, Paper, Stack, Typography } from "@mui/material";
import type { SpecializationWithMeta } from "../../pages/translator-settings/types";

interface SpecializationsSectionProps {
    specializations: SpecializationWithMeta[];
}

export function SpecializationsSection({ specializations }: SpecializationsSectionProps) {
    return (
        <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
                Специализации
            </Typography>
            {specializations.length === 0 ? (
                <Typography color="text.secondary">
                    Специализации пока не выбраны.
                </Typography>
            ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {specializations.map((spec) => (
                        <Chip
                            key={spec.id}
                            label={spec.title}
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 999 }}
                        />
                    ))}
                </Stack>
            )}
        </Paper>
    );
}

