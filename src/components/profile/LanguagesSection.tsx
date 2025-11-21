import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import type { Currency, LanguagePairDTO } from "../../pages/translator-settings/types";

interface LanguagesSectionProps {
    languages: LanguagePairDTO[];
    currency: Currency | null;
    formatLanguagePair: (pair: LanguagePairDTO, currency: Currency | null) => {
        pricePerWord: string;
        pricePerHour: string;
    };
}

export function LanguagesSection({
    languages,
    currency,
    formatLanguagePair,
}: LanguagesSectionProps) {
    return (
        <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
                Языковые пары и тарифы
            </Typography>
            {languages.length === 0 ? (
                <Typography color="text.secondary">
                    Переводчик ещё не указал языковые пары.
                </Typography>
            ) : (
                <Table size="small" sx={{ mt: 1 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Пара</TableCell>
                            <TableCell>Цена за слово</TableCell>
                            <TableCell>Цена в час</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {languages.map((pair, index) => {
                            const { pricePerWord, pricePerHour } = formatLanguagePair(pair, currency);
                            return (
                                <TableRow
                                    key={`${pair.language_from}-${pair.language_to}-${index}`}
                                >
                                    <TableCell>
                                        {pair.language_from?.name ?? "—"} → {pair.language_to?.name ?? "—"}
                                    </TableCell>
                                    <TableCell>{pricePerWord}</TableCell>
                                    <TableCell>{pricePerHour}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </Paper>
    );
}

