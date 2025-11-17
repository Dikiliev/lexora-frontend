import { Box, Button, TextField } from "@mui/material";
import type { FormEvent } from "react";

interface ChatComposerProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    disabled?: boolean;
}

export function ChatComposer({ value, onChange, onSubmit, disabled }: ChatComposerProps) {
    return (
        <Box component="form" onSubmit={onSubmit} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
                multiline
                minRows={1}
                maxRows={6}
                placeholder="Введите сообщение..."
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                inputProps={{ style: { lineHeight: 1.4 } }}
                sx={{
                    textarea: {
                        resize: "none",
                        fontSize: 15,
                        lineHeight: 1.5,
                    },
                }}
            />
            <Button type="submit" variant="contained" disabled={!value.trim() || disabled}>
                Отправить
            </Button>
        </Box>
    );
}


