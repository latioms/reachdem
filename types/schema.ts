
export type Project = {
    id: string;
    sender_name: string;
    account_id: string;
    sms_credits: number;
}

export type Contact = {
    contact_id: string;
    phonebook_id: string;
    first_name: string;
    last_name: string;
    phone: string;
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