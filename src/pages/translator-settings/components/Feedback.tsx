import { Alert, Stack } from "@mui/material";

interface FeedbackProps {
    error: string | null;
    success: string | null;
}

export function Feedback({ error, success }: FeedbackProps) {
    if (!error && !success) return null;

    return (
        <Stack spacing={1}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
        </Stack>
    );
}

