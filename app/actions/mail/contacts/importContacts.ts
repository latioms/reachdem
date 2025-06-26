'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID } from "appwrite";
import { revalidatePath } from "next/cache";
import { contactSchema } from "@/lib/validations/contact";
import { z } from "zod";
import { chunk } from "lodash";

interface ImportContactResult {
  success: number;
  failed: number;
  errors: { email: string; error: string }[];
}

export async function importContacts(contacts: { email: string; [key: string]: string }[]) {
  try {
    const { user } = await checkAuth();

    if (!user) {
      return {
        error: "User not authenticated cannot import contacts",
      };
    }

    const result: ImportContactResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    // First, validate all contacts and prepare them for insertion
    const validContacts: Array<{
      id: string;
      data: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address: string;
        user_id: string;
      }
    }> = [];
    
    // Individual validation of contacts
    for (const contact of contacts) {
      try {
        // Validate contact using the schema
        const validatedContact = contactSchema.parse(contact);
        
        // Skip if email is missing (shouldn't happen due to validation, but just in case)
        if (!validatedContact.email) {
          result.failed++;
          result.errors.push({ email: contact.email || 'Unknown', error: "Email is required" });
          continue;
        }
        
        // Prepare contact for bulk insertion
        validContacts.push({
          id: ID.unique(),
          data: {
            first_name: validatedContact.first_name?.trim() || '',
            last_name: validatedContact.last_name?.trim() || '',
            email: validatedContact.email.trim(),
            phone: validatedContact.phone?.trim() || '',
            address: validatedContact.address?.trim() || '',
            user_id: user.id,
          }
        });
      } catch (err) {
        result.failed++;
        const error = err instanceof z.ZodError 
          ? err.errors[0]?.message || "Validation error" 
          : "Failed to create contact";
          
        result.errors.push({ email: contact.email || 'Unknown', error });
      }
    }
    
    // Split contacts into chunks of 100 (Appwrite's recommended batch size)
    const contactChunks = chunk(validContacts, 100);
    
    // Process each chunk with bulk operations
    for (const contactChunk of contactChunks) {
      try {
        // Create documents in bulk
        const promises = contactChunk.map(contact => 
          databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,
            contact.id,
            contact.data
          )
        );
        
        // Wait for all bulk operations to complete
        const results = await Promise.allSettled(promises);
          // Process results
        results.forEach((promiseResult, index) => {
          if (promiseResult.status === 'fulfilled') {
            // Success
            result.success++;
          } else {
            // Failure
            result.failed++;
            const contactEmail = contactChunk[index]?.data.email || 'Unknown';
            result.errors.push({ 
              email: contactEmail, 
              error: promiseResult.reason?.message || "Failed to create contact" 
            });
          }
        });
      } catch (err) {
        console.error('Bulk operation error:', err);
        // If the entire bulk operation fails, mark all contacts in this chunk as failed
        result.failed += contactChunk.length;
        contactChunk.forEach(contact => {
          result.errors.push({ 
            email: contact.data.email, 
            error: "Bulk operation error" 
          });
        });
      }
    }

    // Refresh data
    revalidatePath("/[locale]/platform/contacts");
    
    return {
      data: result,
    };
  } catch (error) {
    console.error("Error importing contacts:", error);
    return {
      error: "Failed to import contacts"
    };
  }
}