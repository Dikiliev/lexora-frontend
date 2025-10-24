import { Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CTA() {
    const nav = useNavigate();
    return (
        <Paper sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: "linear-gradient(90deg,#FF4D2E 0%, #FF7A63 100%)",
            color: "#fff",
        }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight={800}>
                    Готовы найти переводчика?
                </Typography>
                <Button onClick={() => nav("/search")} variant="contained" sx={{ bgcolor: "#fff", color: "text.primary" }}>
                    Начать поиск
                </Button>
            </Stack>
        </Paper>
    );
}
