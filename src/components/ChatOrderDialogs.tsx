import { type ChangeEvent, type FormEvent } from "react";
import {
    Box,
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Autocomplete } from "@mui/material";
import { useCurrencies } from "../hooks/useCurrencies";
import { useLanguages } from "../hooks/useLanguages";

import type { Currency, Language } from "../pages/translator-settings/types";

export interface OrderFormState {
    title: string;
    description: string;
    source_lang_id: number | null;
    target_lang_id: number | null;
    volume: string;
    price: string;
    currency_id: number | null;
    deadline: string;
}

export interface RequestChangeFormState {
    description: string;
    volume: string;
    price: string;
    currency_id: number | null;
    deadline: string;
}

interface CreateDialogProps {
    open: boolean;
    form: OrderFormState;
    error: string | null;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onChange: (
        field: keyof OrderFormState,
    ) => (event: ChangeEvent<HTMLInputElement> | { target: { value: number | null } }) => void;
}

interface RequestChangeDialogProps {
    open: boolean;
    form: RequestChangeFormState;
    canSubmit: boolean;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onChange: (
        field: keyof RequestChangeFormState,
    ) => (event: ChangeEvent<HTMLInputElement>) => void;
}

interface ChatOrderDialogsProps {
    isClient: boolean;
    createDialog: CreateDialogProps;
    requestChangeDialog: RequestChangeDialogProps;
}

export function ChatOrderDialogs({
    isClient,
    createDialog,
    requestChangeDialog,
}: ChatOrderDialogsProps) {
    const { languages } = useLanguages();
    const { currencies } = useCurrencies();
    return (
        <>
            {/* Диалог создания заказа (только для клиента) */}
            {isClient && (
                <Dialog
                    open={createDialog.open}
                    onClose={createDialog.onClose}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                    }}
                >
                    <Box component="form" onSubmit={createDialog.onSubmit}>
                        <DialogTitle
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                pb: 1,
                            }}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Предложить заказ
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                >
                                    Опишите задачу, ставки и срок — переводчик
                                    получит структурированное предложение.
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={createDialog.onClose}
                                size="small"
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ pt: 1, pb: 1 }}>
                            <Stack spacing={2.25} sx={{ pt: 0.5 }}>
                                {createDialog.error && (
                                    <Alert severity="error">
                                        {createDialog.error}
                                    </Alert>
                                )}

                                <TextField
                                    label="Название"
                                    value={createDialog.form.title}
                                    onChange={createDialog.onChange("title")}
                                    required
                                    fullWidth
                                />

                                <TextField
                                    label="Описание"
                                    value={createDialog.form.description}
                                    onChange={createDialog.onChange(
                                        "description",
                                    )}
                                    required
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={2}
                                >
                                    <Autocomplete
                                        options={languages}
                                        getOptionLabel={(option) => option.name}
                                        value={
                                            languages.find(
                                                (lang) => lang.id === createDialog.form.source_lang_id,
                                            ) ?? null
                                        }
                                        onChange={(_event, value) => {
                                            const event = {
                                                target: { value: value?.id ?? null },
                                            } as ChangeEvent<HTMLInputElement>;
                                            createDialog.onChange("source_lang_id")(event);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Язык исходный"
                                                placeholder="Выберите язык"
                                                required
                                                fullWidth
                                            />
                                        )}
                                        fullWidth
                                    />
                                    <Autocomplete
                                        options={languages}
                                        getOptionLabel={(option) => option.name}
                                        value={
                                            languages.find(
                                                (lang) => lang.id === createDialog.form.target_lang_id,
                                            ) ?? null
                                        }
                                        onChange={(_event, value) => {
                                            const event = {
                                                target: { value: value?.id ?? null },
                                            } as ChangeEvent<HTMLInputElement>;
                                            createDialog.onChange("target_lang_id")(event);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Язык перевода"
                                                placeholder="Выберите язык"
                                                required
                                                fullWidth
                                            />
                                        )}
                                        fullWidth
                                    />
                                </Stack>

                                <TextField
                                    label="Объём (слов/стр.)"
                                    value={createDialog.form.volume}
                                    onChange={createDialog.onChange("volume")}
                                    fullWidth
                                />

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={2}
                                >
                                    <TextField
                                        label="Стоимость"
                                        type="number"
                                        value={createDialog.form.price}
                                        onChange={createDialog.onChange(
                                            "price",
                                        )}
                                        required
                                        fullWidth
                                        inputProps={{
                                            min: 0,
                                            step: "0.01",
                                        }}
                                    />
                                    <TextField
                                        label="Валюта"
                                        select
                                        value={createDialog.form.currency_id ?? ""}
                                        onChange={(event) => {
                                            const value = event.target.value === "" ? null : Number(event.target.value);
                                            const changeEvent = {
                                                target: { value },
                                            } as ChangeEvent<HTMLInputElement>;
                                            createDialog.onChange("currency_id")(changeEvent);
                                        }}
                                        fullWidth
                                    >
                                        {currencies.map((currency) => (
                                            <MenuItem
                                                key={currency.id}
                                                value={currency.id}
                                            >
                                                {currency.code} ({currency.name})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>

                                <TextField
                                    label="Дедлайн"
                                    type="datetime-local"
                                    InputLabelProps={{ shrink: true }}
                                    value={createDialog.form.deadline}
                                    onChange={createDialog.onChange("deadline")}
                                    fullWidth
                                />
                            </Stack>
                        </DialogContent>

                        <DialogActions
                            sx={{
                                px: 3,
                                pt: 2,
                                pb: 2.25,
                                borderTop: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Button onClick={createDialog.onClose}>
                                Отмена
                            </Button>
                            <Button type="submit" variant="contained">
                                Создать
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            )}

            {/* Диалог запроса изменений по заказу */}
            <Dialog
                open={requestChangeDialog.open}
                onClose={requestChangeDialog.onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 18px 40px rgba(15,23,42,.14)",
                    },
                }}
            >
                <Box component="form" onSubmit={requestChangeDialog.onSubmit}>
                    <DialogTitle
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            pb: 1,
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            Предложить изменения по заказу
                        </Typography>
                        <IconButton
                            onClick={requestChangeDialog.onClose}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 1, pb: 1 }}>
                        <Stack spacing={2.25} sx={{ pt: 0.5 }}>
                            <TextField
                                label="Описание"
                                value={requestChangeDialog.form.description}
                                onChange={requestChangeDialog.onChange(
                                    "description",
                                )}
                                multiline
                                minRows={3}
                                fullWidth
                            />

                            <TextField
                                label="Объём"
                                value={requestChangeDialog.form.volume}
                                onChange={requestChangeDialog.onChange(
                                    "volume",
                                )}
                                fullWidth
                            />

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                            >
                                <TextField
                                    label="Стоимость"
                                    type="number"
                                    value={requestChangeDialog.form.price}
                                    onChange={requestChangeDialog.onChange(
                                        "price",
                                    )}
                                    fullWidth
                                    inputProps={{
                                        min: 0,
                                        step: "0.01",
                                    }}
                                />
                                <TextField
                                    label="Валюта"
                                    select
                                    value={requestChangeDialog.form.currency_id ?? ""}
                                    onChange={(event) => {
                                        const value = event.target.value === "" ? null : Number(event.target.value);
                                        const changeEvent = {
                                            target: { value },
                                        } as ChangeEvent<HTMLInputElement>;
                                        requestChangeDialog.onChange("currency_id")(changeEvent);
                                    }}
                                    fullWidth
                                >
                                    {currencies.map((currency) => (
                                        <MenuItem
                                            key={currency.id}
                                            value={currency.id}
                                        >
                                            {currency.code} ({currency.name})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>

                            <TextField
                                label="Дедлайн"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                                value={requestChangeDialog.form.deadline}
                                onChange={requestChangeDialog.onChange(
                                    "deadline",
                                )}
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions
                        sx={{
                            px: 3,
                            pt: 2,
                            pb: 2.25,
                            borderTop: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Button onClick={requestChangeDialog.onClose}>
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!requestChangeDialog.canSubmit}
                        >
                            Отправить
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
}
