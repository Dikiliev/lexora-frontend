import { Paper, Stack } from "@mui/material";

export default function LogosStrip() {
    return (
        <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center" justifyContent="center">
            {["Acme", "Globex", "Umbrella", "Stark", "Wayne"].map((n) => (
                <Paper key={n} sx={{
                    px: 2, py: 1, borderRadius: 2, border: "1px solid", borderColor: "divider",
                    typography: "subtitle2", color: "text.secondary",
                }}>
                    {n}
                </Paper>
            ))}
        </Stack>
    );
}
