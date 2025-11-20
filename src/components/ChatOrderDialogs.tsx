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

export interface OrderFormState {
    title: string;
    description: string;
    source_lang: string;
    target_lang: string;
    volume: string;
    price: string;
    currency: string;
    deadline: string;
}

export interface RequestChangeFormState {
    description: string;
    volume: string;
    price: string;
    currency: string;
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
    ) => (event: ChangeEvent<HTMLInputElement>) => void;
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

const CURRENCIES = ["RUB", "USD", "EUR"];

export function ChatOrderDialogs({
    isClient,
    createDialog,
    requestChangeDialog,
}: ChatOrderDialogsProps) {
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
                                    <TextField
                                        label="Язык исходный"
                                        value={createDialog.form.source_lang}
                                        onChange={createDialog.onChange(
                                            "source_lang",
                                        )}
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        label="Язык перевода"
                                        value={createDialog.form.target_lang}
                                        onChange={createDialog.onChange(
                                            "target_lang",
                                        )}
                                        required
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
                                        value={createDialog.form.currency}
                                        onChange={createDialog.onChange(
                                            "currency",
                                        )}
                                        fullWidth
                                    >
                                        {CURRENCIES.map((currency) => (
                                            <MenuItem
                                                key={currency}
                                                value={currency}
                                            >
                                                {currency}
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
                                    value={requestChangeDialog.form.currency}
                                    onChange={requestChangeDialog.onChange(
                                        "currency",
                                    )}
                                    fullWidth
                                >
                                    {CURRENCIES.map((currency) => (
                                        <MenuItem
                                            key={currency}
                                            value={currency}
                                        >
                                            {currency}
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
