'use server'

import { account, client } from '@/lib/appwrite'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { UpdateNameInput, UpdatePasswordInput } from '@/lib/validations/auth'

/**
 * Update user's name
 */
export async function updateUserName(data: UpdateNameInput) {
  try {
    const session = (await cookies()).get('session')
    if (!session) {
      return {
        success: false,
        error: "Utilisateur non authentifié"
      }
    }

    // Set session for the request
    client.setSession(session.value)

    // Update name using Appwrite
    await account.updateName(data.name)

    // Revalidate relevant pages
    revalidatePath('/profile')
    revalidatePath('/', 'layout')

    return {
      success: true,
      message: "Nom mis à jour avec succès"
    }
  } catch (error: any) {
    console.error('Error updating name:', error)
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour du nom"
    }
  }
}

/**
 * Update user's password
 */
export async function updateUserPassword(data: UpdatePasswordInput) {
  try {
    const session = (await cookies()).get('session')
    if (!session) {
      return {
        success: false,
        error: "Utilisateur non authentifié"
      }
    }

    // Set session for the request
    client.setSession(session.value)

    // Update password using Appwrite
    await account.updatePassword(data.newPassword, data.currentPassword)

    return {
      success: true,
      message: "Mot de passe mis à jour avec succès"
    }
  } catch (error: any) {
    console.error('Error updating password:', error)
    
    // Handle specific Appwrite errors
    if (error.code === 401) {
      return {
        success: false,
        error: "Mot de passe actuel incorrect"
      }
    }
    
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour du mot de passe"
    }
  }
}

/**
 * Get current user profile data
 */
export async function getUserProfile() {
  try {
    const session = (await cookies()).get('session')
    if (!session) {
      return {
        success: false,
        error: "Utilisateur non authentifié"
      }
    }

    // Set session for the request
    client.setSession(session.value)

    // Get user data from Appwrite
    const user = await account.get()

    return {
      success: true,
      data: {
        id: user.$id,
        name: user.name,
        email: user.email,
        emailVerification: user.emailVerification,
        registration: user.registration
      }
    }
  } catch (error: any) {
    console.error('Error getting user profile:', error)
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération du profil"
    }
  }
}

/**
 * Upload and update user avatar
 * Note: This is a placeholder for future avatar functionality
 * Appwrite doesn't have built-in avatar support for accounts, 
 * so this would require setting up file storage and custom implementation
 */
export async function updateUserAvatar(file: File) {
  try {
    // This would require setting up Appwrite storage bucket and custom logic
    // For now, return a placeholder response
    return {
      success: false,
      error: "Fonctionnalité de changement d'avatar en cours de développement"
    }
  } catch (error: any) {
    console.error('Error updating avatar:', error)
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour de la photo de profil"
    }
  }
}