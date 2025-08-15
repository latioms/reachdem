'use client'
import { useState, useEffect } from "react"
import { trackNavigationEvent } from "@/lib/tracking"
import { useAuth } from "@/context/authContext"
import { useUserProjects } from "@/hooks/use-projects"
import { listGroups, getContactsFromGroups } from "@/app/actions/campaigns/targetsActions"
import { createCampaign, CreateCampaignData } from "@/app/actions/campaigns/campaignActions"
import { Group } from "@/types/schema"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, MessageCircle } from "lucide-react"


interface DialogCampaignProps {
	children: React.ReactNode;
	dictionary?: any;
	onCampaignCreated?: () => void;
}

export function DialogCampaign({ children, dictionary, onCampaignCreated }: DialogCampaignProps) {
	const [open, setOpen] = useState(false)
	const [currentStep, setCurrentStep] = useState(1)
	const [campaignType, setCampaignType] = useState<'sms' | 'whatsapp' | null>(null)
	const [campaignName, setCampaignName] = useState("")
	const [campaignMessage, setCampaignMessage] = useState("")
	const [selectedProjectId, setSelectedProjectId] = useState("")
	const [groups, setGroups] = useState<Group[]>([])
	const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
	const [validContactsCount, setValidContactsCount] = useState<number>(0)
	const [isLoadingContacts, setIsLoadingContacts] = useState(false)
	const [isCreating, setIsCreating] = useState(false)
	
	const { currentUser } = useAuth()
	const { data: projects, isLoading: projectsLoading } = useUserProjects(currentUser?.id)

	// Charger les groupes quand on arrive à l'étape 3
	useEffect(() => {
		if (currentStep === 3) {
			const loadGroups = async () => {
				const groupsData = await listGroups()
				setGroups(groupsData)
			}
			loadGroups()
		}
	}, [currentStep])

	// Charger le nombre de contacts valides quand un groupe est sélectionné
	useEffect(() => {
		const loadValidContactsCount = async () => {
			if (selectedGroups.size > 0) {
				setIsLoadingContacts(true)
				try {
					const validContacts = await getContactsFromGroups(Array.from(selectedGroups))
					setValidContactsCount(validContacts.length)
				} catch (error) {
					console.error('Erreur lors du chargement des contacts:', error)
					setValidContactsCount(0)
				}
				setIsLoadingContacts(false)
			} else {
				setValidContactsCount(0)
			}
		}

		loadValidContactsCount()
	}, [selectedGroups])

	const resetDialog = () => {
		setCurrentStep(1)
		setCampaignType(null)
		setCampaignName("")
		setCampaignMessage("")
		setSelectedProjectId("")
		setSelectedGroups(new Set())
		setValidContactsCount(0)
		setIsLoadingContacts(false)
		setIsCreating(false)
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

		// Passer à l'étape 3 pour sélectionner les cibles
		setCurrentStep(3)
	}

	const toggleGroup = (groupId: string) => {
		setSelectedGroups(prev => {
			const newSet = new Set(prev)
			if (newSet.has(groupId)) {
				newSet.delete(groupId)
			} else {
				newSet.add(groupId)
			}
			return newSet
		})
	}

	const handleFinalSubmit = async () => {
		if (!campaignMessage.trim()) {
			toast.error("Veuillez saisir un message")
			return
		}
		
		if (selectedGroups.size === 0) {
			toast.error("Veuillez sélectionner au moins un groupe")
			return
		}

		if (validContactsCount === 0) {
			toast.error("Aucun contact avec numéro de téléphone trouvé dans le groupe sélectionné")
			return
		}

		setIsCreating(true)
		try {
			const result = await createCampaign({
				project_id: selectedProjectId,
				name: campaignName,
				message: campaignMessage,
				contact_targets: [], // Plus de contacts individuels
				group_targets: Array.from(selectedGroups),
				type: campaignType as 'sms' | 'whatsapp'
			} as CreateCampaignData)

			if (result) {
				toast.success(`Campagne créée avec succès! ${validContactsCount} contacts seront ciblés.`)
				setOpen(false)
				onCampaignCreated?.()
			} else {
				toast.error("Erreur lors de la création de la campagne")
			}
		} catch (error) {
			toast.error("Erreur lors de la création de la campagne")
			console.error(error)
		}
		setIsCreating(false)
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

	const renderStepThree = () => (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="campaign-message">Message *</Label>
				<Textarea
					id="campaign-message"
					placeholder="Saisissez votre message"
					value={campaignMessage}
					onChange={(e) => setCampaignMessage(e.target.value)}
					maxLength={160}
					rows={3}
				/>
				<div className="text-sm text-muted-foreground text-right">
					{campaignMessage.length}/160 caractères
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="group-select">Sélection des groupes *</Label>
				<Select 
					value={selectedGroups.size > 0 ? Array.from(selectedGroups)[0] : ""} 
					onValueChange={(value) => {
						if (value) {
							setSelectedGroups(new Set([value]))
						} else {
							setSelectedGroups(new Set())
						}
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder="Sélectionnez un groupe" />
					</SelectTrigger>
					<SelectContent>
						{groups.length > 0 ? (
							groups.map((group) => (
								<SelectItem key={group.$id} value={group.$id}>
									{group.group_name}
								</SelectItem>
							))
						) : (
							<SelectItem value="no-groups" disabled>
								Aucun groupe disponible
							</SelectItem>
						)}
					</SelectContent>
				</Select>
				{selectedGroups.size > 0 && (
					<div className="text-sm space-y-1">
						<p className="text-muted-foreground">
							Groupe sélectionné : {groups.find(g => selectedGroups.has(g.$id))?.group_name}
						</p>
						{isLoadingContacts ? (
							<p className="text-muted-foreground">Vérification des contacts...</p>
						) : (
							<p className={validContactsCount > 0 ? "text-green-600" : "text-orange-600"}>
								{validContactsCount > 0 
									? `${validContactsCount} contact${validContactsCount > 1 ? 's' : ''} avec numéro de téléphone`
									: "Aucun contact avec numéro de téléphone trouvé"
								}
							</p>
						)}
					</div>
				)}
			</div>

			<div className="flex justify-between pt-4">
				<Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isCreating}>
					Retour
				</Button>
				<Button onClick={handleFinalSubmit} disabled={isCreating}>
					{isCreating ? "Création..." : "Créer la campagne"}
				</Button>
			</div>
		</div>
	)
	const renderStepIndicators = () => (
		<div className="flex flex-col space-y-4 justify-center items-center py-4 border-t">
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
						: currentStep > 2
							? 'bg-primary/20 text-primary'
							: 'bg-muted text-muted-foreground'
				}`}>
					{currentStep > 2 ? (
						<div className="w-1.5 h-1.5 rounded-full bg-primary" />
					) : (
						<div className="w-1.5 h-1.5 rounded-full bg-current" />
					)}
				</div>

				{/* Separator */}
				<div className={`w-8 h-0.5 transition-all ${
					currentStep > 2 ? 'bg-primary/30' : 'bg-muted'
				}`} />

				{/* Step 3 Indicator */}
				<div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
					currentStep === 3 
						? 'bg-primary text-primary-foreground' 
						: 'bg-muted text-muted-foreground'
				}`}>
					<div className="w-1.5 h-1.5 rounded-full bg-current" />
				</div>
			</div>
			
			{/* Step Labels */}
			<div className="flex items-center space-x-8 text-xs text-muted-foreground">
				<span className={currentStep === 1 ? 'text-foreground font-medium' : ''}>
					Type
				</span>
				<span className={currentStep === 2 ? 'text-foreground font-medium' : ''}>
					Configuration
				</span>
				<span className={currentStep === 3 ? 'text-foreground font-medium' : ''}>
					Groupes
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
								: currentStep === 2
									? `${dictionary?.new || "Nouvelle campagne"} - ${campaignType?.toUpperCase()}`
									: `${dictionary?.new || "Nouvelle campagne"} - Groupes`
							}
						</DialogTitle>
					</DialogHeader>
					
					{currentStep === 1 && renderStepOne()}
					{currentStep === 2 && renderStepTwo()}
					{currentStep === 3 && renderStepThree()}
					
					{renderStepIndicators()}
				</DialogContent>
			</Dialog>
		</>
	)
}