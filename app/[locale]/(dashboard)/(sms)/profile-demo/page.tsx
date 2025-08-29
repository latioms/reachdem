'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Lock, Camera, Mail } from 'lucide-react'
import { UpdateNameInput, UpdatePasswordInput, updateNameSchema, updatePasswordSchema } from '@/lib/validations/auth'

interface ProfileData {
  id: string
  name: string
  email: string
  emailVerification: boolean
  registration: string
}

export default function ProfileDemo() {
  // Mock profile data for demo
  const [profileData] = useState<ProfileData>({
    id: "demo-user",
    name: "Test User",
    email: "test@example.com",
    emailVerification: true,
    registration: new Date().toISOString()
  })

  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Form for name update
  const nameForm = useForm<UpdateNameInput>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: profileData.name
    }
  })

  // Form for password update
  const passwordForm = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Handle name update (demo)
  const onUpdateName = async (data: UpdateNameInput) => {
    setIsUpdatingName(true)
    // Simulate API call
    setTimeout(() => {
      toast.success("Nom mis à jour avec succès")
      setIsUpdatingName(false)
    }, 1000)
  }

  // Handle password update (demo)
  const onUpdatePassword = async (data: UpdatePasswordInput) => {
    setIsUpdatingPassword(true)
    // Simulate API call
    setTimeout(() => {
      toast.success("Mot de passe mis à jour avec succès")
      passwordForm.reset()
      setIsUpdatingPassword(false)
    }, 1000)
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos paramètres de compte
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Aperçu du profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/images/user.png" alt={profileData.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => toast.info("Fonctionnalité de changement de photo à venir")}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Mail className="h-3 w-3" />
                  <span className={profileData.emailVerification ? "text-green-600" : "text-yellow-600"}>
                    {profileData.emailVerification ? "Email vérifié" : "Email non vérifié"}
                  </span>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Membre depuis:</span>
                <p className="text-muted-foreground">
                  {new Date(profileData.registration).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Name Update Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Mettez à jour votre nom et autres informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={nameForm.handleSubmit(onUpdateName)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    {...nameForm.register('name')}
                    placeholder="Votre nom complet"
                  />
                  {nameForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {nameForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    L&apos;email ne peut pas être modifié pour le moment
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdatingName || !nameForm.formState.isDirty}
                  className="w-full sm:w-auto"
                >
                  {isUpdatingName ? "Mise à jour..." : "Mettre à jour le profil"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Update Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Modifiez votre mot de passe pour sécuriser votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    placeholder="Votre mot de passe actuel"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    placeholder="Votre nouveau mot de passe"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto"
                >
                  {isUpdatingPassword ? "Mise à jour..." : "Changer le mot de passe"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}