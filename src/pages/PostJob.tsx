import { Autocomplete, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useLanguages } from "../hooks/useLanguages";
import { useCurrencies } from "../hooks/useCurrencies";

export default function PostJob() {
    const { languages } = useLanguages();
    const { currencies } = useCurrencies();

    return (
        <Stack spacing={3}>
            <Typography variant="h2">Разместить заказ</Typography>
            <Box
                component="form"
                onSubmit={(e) => e.preventDefault()}
                sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}
            >
                <TextField label="Название проекта" fullWidth />
                <TextField label="Домен / тематика" fullWidth />
                <Autocomplete
                    options={languages}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                        <TextField {...params} label="Язык исходника" fullWidth />
                    )}
                    fullWidth
                />
                <Autocomplete
                    options={languages}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                        <TextField {...params} label="Язык перевода" fullWidth />
                    )}
                    fullWidth
                />
                <TextField label="Бюджет" type="number" fullWidth />
                <TextField
                    label="Валюта"
                    select
                    defaultValue=""
                    fullWidth
                >
                    {currencies.map((currency) => (
                        <MenuItem key={currency.id} value={currency.code}>
                            {currency.code} ({currency.name})
                        </MenuItem>
                    ))}
                </TextField>
                <TextField label="Сроки" type="datetime-local" InputLabelProps={{ shrink: true }} fullWidth />
                <TextField
                    label="Описание"
                    fullWidth
                    multiline
                    minRows={4}
                    sx={{ gridColumn: { md: "1 / span 2" } }}
                />
                <Button type="submit" variant="contained" sx={{ gridColumn: { md: "1 / span 2" }, justifySelf: "start" }}>
                    Опубликовать
                </Button>
            </Box>
        </Stack>
    );
}
