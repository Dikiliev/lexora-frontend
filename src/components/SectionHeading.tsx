import { Stack, Typography } from "@mui/material";

export default function SectionHeading({
                                           title,
                                           subtitle,
                                           align = "center",
                                       }: { title: string; subtitle?: string; align?: "left" | "center" }) {
    return (
        <Stack spacing={1} alignItems={align === "center" ? "center" : "flex-start"} textAlign={align}>
            <Typography variant="h2">{title}</Typography>
            {subtitle && (
                <Typography color="text.secondary" sx={{ maxWidth: 860 }}>
                    {subtitle}
                </Typography>
            )}
        </Stack>
    );
}
