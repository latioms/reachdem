'use client'
import { useState, useEffect } from "react"
import { trackNavigationEvent } from "@/lib/tracking"
import { useAuth } from "@/context/authContext"
import { useUserProjects } from "@/hooks/use-projects"
import { toast } from "sonner"

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, MessageCircle } from "lucide-react"


interface DialogCampaignProps {
	children: React.ReactNode;
	dictionary?: any;
}

export function DialogCampaign({ children, dictionary }: DialogCampaignProps) {
	const [open, setOpen] = useState(false)
	const [currentStep, setCurrentStep] = useState(1)
	const [campaignType, setCampaignType] = useState<'sms' | 'whatsapp' | null>(null)
	const [campaignName, setCampaignName] = useState("")
	const [selectedProjectId, setSelectedProjectId] = useState("")
	
	const { currentUser } = useAuth()
	const { data: projects, isLoading: projectsLoading } = useUserProjects(currentUser?.id)

	const resetDialog = () => {
		setCurrentStep(1)
		setCampaignType(null)
		setCampaignName("")
		setSelectedProjectId("")
	}

	const handleStepOneNext = (type: 'sms' | 'whatsapp') => {
		if (type === 'whatsapp') {
			// WhatsApp is disabled for now
			return
		}
		setCampaignType(type)
		setCurrentStep(2)
	}

	const handleStepTwoSubmit = () => {
		if (!campaignName.trim() || !selectedProjectId) {
			toast.error("Veuillez remplir tous les champs requis")
			return
		}

		const result = {
			redirect: false,
			campaign_name: campaignName,
			project_id: selectedProjectId,
		}

		toast.success("Données de campagne", {
			description: JSON.stringify(result, null, 2)
		})
	}

	const renderStepOne = () => (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground mb-6">
				Choisissez le type de campagne que vous souhaitez créer
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* SMS Card */}
				<Card 
					className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary"
					onClick={() => handleStepOneNext('sms')}
				>
					<CardHeader>
						<div className="flex mb-4 items-center space-x-2">
							<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
								<MessageSquare className="w-6 h-6 text-primary" />
							</div>
							<CardTitle>SMS</CardTitle>
						</div>
						<CardDescription>
							Envoyez des messages SMS à vos contacts
						</CardDescription>
					</CardHeader>
				</Card>

				{/* WhatsApp Card - Disabled */}
				<Card className="cursor-not-allowed opacity-50 border-2  relative">
					<CardHeader className="text-center">
						<div className="mx-auto mb-2 w-12 h-12 rounded-full flex items-center justify-center">
							<MessageCircle className="w-6 h-6 text-muted-foreground border-primary-foreground" />
						</div>
						<CardTitle className="text-muted">WhatsApp</CardTitle>
						<CardDescription>
							Envoyez des messages WhatsApp à vos contacts
						</CardDescription>
					</CardHeader>
					<div className="absolute inset-0 flex items-center justify-center rounded-lg">
						<span className="text-sm font-medium bg-m px-3 py-1 rounded-full">
							En développement
						</span>
					</div>
				</Card>
			</div>
		</div>
	)

	const renderStepTwo = () => (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="campaign-name">Nom de la campagne *</Label>
				<Input
					id="campaign-name"
					placeholder="Entrez le nom de votre campagne"
					value={campaignName}
					onChange={(e) => setCampaignName(e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="project-select">Projet *</Label>
				<Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
					<SelectTrigger>
						<SelectValue placeholder="Sélectionnez un projet" />
					</SelectTrigger>
					<SelectContent>
						{projectsLoading ? (
							<SelectItem value="loading" disabled>
								Chargement des projets...
							</SelectItem>
						) : projects?.length ? (
							projects.map((project) => (
								<SelectItem key={project.id} value={project.id}>
									{project.sender_name}
								</SelectItem>
							))
						) : (
							<SelectItem value="no-projects" disabled>
								Aucun projet disponible
							</SelectItem>
						)}
					</SelectContent>
				</Select>
			</div>

			<div className="flex justify-between pt-4">
				<Button variant="outline" onClick={() => setCurrentStep(1)}>
					Retour
				</Button>
				<Button onClick={handleStepTwoSubmit}>
					Créer la campagne
				</Button>
			</div>
		</div>
	)

	const renderStepIndicators = () => (
		<div className="flex  flex-col space-y-4 justify-center items-center space-x-2 py-4 border-t">
			<div className="flex items-center">
				{/* Step 1 Indicator */}
				<div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
					currentStep === 1 
						? 'bg-primary text-primary-foreground' 
						: currentStep > 1 
							? 'bg-primary/20 text-primary' 
							: 'bg-muted text-muted-foreground'
				}`}>
					{currentStep > 1 ? (
						<div className="w-1.5 h-1.5 rounded-full bg-primary" />
					) : (
						<div className="w-1.5 h-1.5 rounded-full bg-current" />
					)}
				</div>
				
				{/* Separator */}
				<div className={`w-8 h-0.5 transition-all ${
					currentStep > 1 ? 'bg-primary/30' : 'bg-muted'
				}`} />
				
				{/* Step 2 Indicator */}
				<div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
					currentStep === 2 
						? 'bg-primary text-primary-foreground' 
						: 'bg-muted text-muted-foreground'
				}`}>
					<div className="w-1.5 h-1.5 rounded-full bg-current" />
				</div>
			</div>
			
			{/* Step Labels */}
			<div className="ml-4 flex items-center space-x-8 text-xs text-muted-foreground">
				<span className={currentStep === 1 ? 'text-foreground font-medium' : ''}>
					Type
				</span>
				<span className={currentStep === 2 ? 'text-foreground font-medium' : ''}>
					Configuration
				</span>
			</div>
		</div>
	)

	return (
		<>
			<Dialog open={open} onOpenChange={(newOpen) => {
				setOpen(newOpen)
				if (newOpen) {
					trackNavigationEvent.modalOpen('campaign-dialog')
				} else {
					trackNavigationEvent.modalClose('campaign-dialog')
					// Reset dialog state when closed
					setTimeout(resetDialog, 200)
				}
			}}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className="max-w-2xl lg:min-w-2xl w-full">
					<DialogHeader>
						<DialogTitle>
							{currentStep === 1 
								? (dictionary?.new || "Nouvelle campagne") 
								: `${dictionary?.new || "Nouvelle campagne"} - ${campaignType?.toUpperCase()}`
							}
						</DialogTitle>
					</DialogHeader>
					
					{currentStep === 1 && renderStepOne()}
					{currentStep === 2 && renderStepTwo()}
					
					{renderStepIndicators()}
				</DialogContent>
			</Dialog>
		</>
	)
}