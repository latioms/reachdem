"use client";
import { useEffect, useState } from 'react';
import { getCampaigns } from '@/app/actions/campaigns/campaignActions';
import { Campaign } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogCampaign } from './dialog-campaign';
import { Plus, Users, UserCheck, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Props {
	projectId?: string;
	dictionary?: any;
}

export default function CampaignListClient({ projectId, dictionary }: Props) {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);

	const loadCampaigns = async () => {
		setLoading(true);
		try {
			const data = await getCampaigns(projectId);
			setCampaigns(data);
		} catch (error) {
			console.error('Erreur lors du chargement des campagnes:', error);
		}
		setLoading(false);
	};

	useEffect(() => {
		loadCampaigns();
	}, [projectId]);

	// Fonction pour rafraîchir après création d'une campagne
	const handleCampaignCreated = () => {
		loadCampaigns();
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<DialogCampaign dictionary={dictionary}>
						<Button><Plus className="h-4 w-4 mr-2" />Nouvelle campagne</Button>
					</DialogCampaign>
				</div>
				<div className="grid gap-4">
					{[1, 2, 3].map(i => (
						<div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<DialogCampaign dictionary={dictionary} onCampaignCreated={handleCampaignCreated}>
					<Button><Plus className="h-4 w-4 mr-2" />Nouvelle campagne</Button>
				</DialogCampaign>
			</div>

			{campaigns.length === 0 ? (
				<Card className="text-center py-12">
					<CardContent>
						<MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<CardTitle className="mb-2">Aucune campagne</CardTitle>
						<CardDescription className="mb-4">
							Créez votre première campagne SMS pour commencer à communiquer avec vos contacts.
						</CardDescription>
						<DialogCampaign dictionary={dictionary} onCampaignCreated={handleCampaignCreated}>
							<Button><Plus className="h-4 w-4 mr-2" />Créer ma première campagne</Button>
						</DialogCampaign>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{campaigns.map((campaign, index) => (
						<Card key={campaign.$id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									{/* Checkbox et info principale */}
									<div className="flex items-center space-x-4 flex-1">
										<input type="checkbox" className="rounded border-gray-300" />
										<Link href={`/campaigns/${campaign.$id}`} className="hover:underline">
											<h3 className="font-medium hover: cursor-pointer">{campaign.name}</h3>
										</Link>

										<div className="flex items-center space-x-2">
											<div className={`w-2 h-2 rounded-full ${campaign.status === 'sent' ? 'bg-green-500' :
												campaign.status === 'sending' ? 'bg-yellow-500' :
													campaign.status === 'scheduled' ? 'bg-blue-500' :
														campaign.status === 'failed' ? 'bg-red-500' :
															'bg-gray-400'
												}`} />
											<span className="text-sm text-muted-foreground">
												{campaign.status === 'sent' ? 'Envoyée' :
													campaign.status === 'sending' ? 'En cours' :
														campaign.status === 'scheduled' ? 'Planifiée' :
															campaign.status === 'failed' ? 'Échec' :
																'Brouillon'}
											</span>
										</div>

										<div className="flex-1">
											<p className="text-sm text-gray-500">
												{campaign.status === 'sent' && campaign.sent_at ?
													`Envoyée le ${new Date(campaign.sent_at).toLocaleDateString('fr-FR', {
														day: 'numeric',
														month: 'short',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}` :
													`Créée le ${new Date(campaign.created_at || '').toLocaleDateString('fr-FR', {
														day: 'numeric',
														month: 'short',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}`
												}
											</p>
											<p className="text-sm text-gray-400">#{index + 1}</p>
										</div>
									</div>

									{/* Statistiques */}
									<div className="flex items-center space-x-8 text-center">
										<div>
											<div className="text-sm font-medium text-gray-600">Destinataires</div>
											<div className="text-lg font-semibold">{(campaign.contact_targets?.length || 0) + (campaign.group_targets?.length || 0)}</div>
											<div className="text-xs text-gray-500">100%</div>
										</div>

										<div>
											<div className="text-sm font-medium text-gray-600">Ouvertures</div>
											<div className="text-lg font-semibold">-</div>
											<div className="text-xs text-gray-500">-%</div>
										</div>

										<div>
											<div className="text-sm font-medium text-gray-600">Clics</div>
											<div className="text-lg font-semibold">-</div>
											<div className="text-xs text-gray-500">-%</div>
										</div>

										<div>
											<div className="text-sm font-medium text-gray-600">Désinscrit</div>
											<div className="text-lg font-semibold">0</div>
											<div className="text-xs text-gray-500">0%</div>
										</div>
									</div>

									{/* Menu d'actions */}
									<div className="flex items-center space-x-2">
										<Button variant="ghost" size="sm">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
											</svg>
										</Button>

										<Button variant="ghost" size="sm">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
											</svg>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
