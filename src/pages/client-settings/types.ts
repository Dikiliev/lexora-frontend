export interface ClientProfileDTO {
    first_name: string;
    last_name: string;
    company_name: string;
    phone: string | null;
    avatar: string | null;
    contacts: Record<string, unknown>;
    order_count: number;
    email_enabled: boolean;
    push_enabled: boolean;
}


