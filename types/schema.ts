export type Project = {
    id: string;
    sender_name: string;
    owner: string;  // Changed from account_id to match the database structure
    sms_credits: number;
    active: "pending" | "enabled" | "disabled";
}

export type Contact = {
    $id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    address?: string;
    user_id: string;
    created_at?: string;
}

export type ContactGroup = {
    group_id: string;
    group_name: string;
}

export type Phonebook = {
    phonebook_id: string;
    project_id: string;
}

export type Campaign = {
    campaign_id: string;
    name: string;
    project_id: string;
    scheduled_time: Date;
    status: string;
    messages: Message[]
}

export type Message = {
    message_id: string;
    delivered_status: string;
    content: string;
    sent_time: Date;
}