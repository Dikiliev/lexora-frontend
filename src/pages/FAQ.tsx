import { Box, Container } from "@mui/material";
import SectionHeading from "../components/SectionHeading";
import FAQ from "../components/FAQ";

export default function FAQPage() {
    return (
        <Container sx={{ py: { xs: 4, md: 6 }, maxWidth: 900 }}>
            <SectionHeading title="Часто задаваемые вопросы" align="left" />
            <Box sx={{ mt: 4 }}>
                <FAQ />
            </Box>
        </Container>
    );
}

