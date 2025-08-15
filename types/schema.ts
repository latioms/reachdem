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
    segment_ids?: string[]; // Pour les requêtes rapides côté client
    created_at?: string;
}

export type Group = {
    $id: string;
    user_id: string;
    group_name: string;
    description?: string;
    created_at?: string;
}

export type GroupContact = {
    $id: string;
    group_id: string;
    contact_id: string;
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
    $id: string;
    project_id: string; // ID du projet auquel la campagne est associée
    name: string;
    description?: string;
    message: string; // Contenu du message à envoyer
    
    // Cibles de la campagne
    contact_targets: string[]; // IDs des contacts directs
    group_targets: string[]; // IDs des groupes
    
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    type: 'sms' | 'whatsapp' | 'email';
    
    scheduled_at?: string; // ISO string pour Appwrite
    sent_at?: string;
    
    created_at?: string;
    updated_at?: string;
    user_id: string; // Pour la sécurité Appwrite
}

export type Stats = {
    $id: string;
    campaign_id: string;
    // Stats des contacts
    total_contacts: number;
    sent_count: number;
    // Targetability stats
    delivered_count?: number; //Pour les mails
    failed_count: number;
    // Stats des interactions
    opened_count?: number; // Pour les emails
    clicked_count: number; // Pour les SMS et les mails.
    unsubscribed_count?: number; // Pour les emails

    created_at?: string;
    updated_at?: string;
}

export type Message = {
    message_id: string;
    delivered_status: string;
    content: string;
    sent_time: Date;
}

export type Segment = {
    $id: string;
    name: string;
    color: "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "gray";
    user_id: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export type ContactSegment = {
    $id: string;
    contact_id: string;
    segment_id: string;
    created_at?: string;
}

// Types pour les statistiques des segments
export type SegmentStats = {
    segment_id: string;
    contact_count: number;
    last_updated: string;
}

// Type pour affichage enrichi des segments avec leurs infos
export type SegmentContact = {
    segment_id: string;
    segment_name: string;
    segment_color: string;
}

// Type pour les segments avec leurs contacts
export type SegmentWithContacts = Segment & {
    contacts: Contact[];
    contact_count: number;
}

// Type pour les contacts avec leurs segments
export type ContactWithSegments = Contact & {
    segments: SegmentContact[];
}