"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, MessageSquare } from "lucide-react"
import { IntroDisclosure } from "@/components/ui/intro-disclosure"
import { steps } from "@/constants/steps"
import Link from "next/link"

interface HeroProps {
	dictionary?: any;
}

export default function Hero({ dictionary }: HeroProps) {
	const [showGuide, setShowGuide] = useState(false)

	useEffect(() => {
		// Désactivé temporairement - guide en cours de réparation
		// const hasVisited = localStorage.getItem("has_visited_before")
		// if (!hasVisited) {
		// 	setShowGuide(true)
		// 	localStorage.setItem("has_visited_before", "true")
		// }
	}, [])

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 lg:px-24 py-16 md:py-24 lg:py-20">
				<div className="grid gap-8 lg:grid-cols-2 lg:gap-10 items-center">
					{/* Contenu textuel */}
					<div className="space-y-6">
						<div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm">
							<span className="flex h-2 w-2 rounded-full animate-pulse bg-emerald-500 mr-2"></span>
							<span>{dictionary.newFeature}</span>
						</div>
						<h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl text-foreground">
							{dictionary.title}<br />
							<span className="text-primary">{dictionary.titleSpan}</span>
						</h1>
						<p className="text-xl text-foreground/80 max-w-lg">
							{dictionary.subtitle}
						</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
								<Link href="/register">{dictionary.startButton}</Link>
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
							{/* Bouton temporairement masqué - guide en cours de réparation */}
							{/* <Button size="lg" variant="outline" onClick={() => setShowGuide(true)}>
								{dictionary.starTour}
								<MessageSquare className="ml-2 h-4 w-4" />
							</Button> */}
						</div>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center">
								<CheckCircle className="mr-1 h-4 w-4 text-primary" />
								{dictionary.trial}
							</div>
							<div className="flex items-center">
								<CheckCircle className="mr-1 h-4 w-4 text-primary" />
								{dictionary.noCard}
							</div>
						</div>
					</div>

					{/* Animation de messages */}
					<div className="relative flex justify-center">
						<PhoneMockup />
					</div>
				</div>
			</div>

			{/* Guide interactif */}
			<IntroDisclosure
				steps={steps}
				open={showGuide}
				setOpen={setShowGuide}
				featureId="main-tour"
				showProgressBar={true}
				onComplete={() => {
					console.log("Tour completed")
				}}
				onSkip={() => {
					console.log("Tour skipped")
				}}
			/>
		</div>
	)
}

function PhoneMockup() {
	const [messages, setMessages] = useState<{ id: number; text: string; sender: string; time: string }[]>([])

	useEffect(() => {
		const initialMessages = [
			{ id: 1, text: "Bonjour, votre commande #12345 a été expédiée!", sender: "acme", time: "09:30" },
			{ id: 2, text: "Mr Toto, vos habits sont prets\n Tam Pressing.", sender: "acme", time: "09:31" },
			{ id: 3, text: "Votre colis sera livré demain entre 10h et 12h.", sender: "acme", time: "09:32" },
		]

		// Animation d'apparition des messages
		let currentIndex = 0
		const interval = setInterval(() => {
			if (currentIndex < initialMessages.length) {
				setMessages((prev) => [...prev, initialMessages[currentIndex]])
				currentIndex++
			} else {
				clearInterval(interval)
				// Réinitialiser après un délai
				setTimeout(() => {
					setMessages([])
					currentIndex = 0
					// Redémarrer l'animation
					setTimeout(() => {
						const newInterval = setInterval(() => {
							if (currentIndex < initialMessages.length) {
								setMessages((prev) => [...prev, initialMessages[currentIndex]])
								currentIndex++
							} else {
								clearInterval(newInterval)
							}
						}, 1000)
					}, 1000)
				}, 3000)
			}
		}, 1000)

		return () => {
			clearInterval(interval)
		}
	}, [])

	return (
		<div className="relative mx-auto pl=2 w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[14px] border-slate-800 shadow-xl overflow-hidden">
			{/* Notch */}
			<div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-lg z-10"></div>

			{/* Screen */}
			<div className="absolute inset-0 bg-white overflow-hidden">
				{/* Header */}
				<div className="sticky top-0 bg-primary text-primary-foreground py-3 justify-center flex items-center z-10">
					<div className="flex flex-col items-center justify-center space-y-1">
						<div className="font-semibold">Tamo Inc.</div>
					</div>
				</div>

				{/* Messages */}
				<div className="p-3 space-y-3 h-[calc(100%-4rem)] overflow-y-auto">
					{messages &&
						messages.length > 0 &&
						messages.map((message) =>
							message && message.sender ? (
								<div
									key={message.id}
									className={`flex ${message.sender === "acme" ? "justify-start" : "justify-end"} animate-fade-in`}
								>
									<div
										className={`max-w-[80%] p-3 rounded-lg ${message.sender === "acme"
											? "bg-muted text-foreground rounded-bl-none"
											: "bg-primary text-primary-foreground rounded-br-none"
											}`}
									>
										<div className="text-sm">{message.text}</div>
										<div className="text-xs mt-1 opacity-80 text-right">{message.time}</div>
									</div>
								</div>
							) : null,
						)}
				</div>

				{/* Input */}
				<div className="absolute bottom-0 inset-x-0 bg-card border-t border-border p-3 flex items-center">
					<div className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
						Tapez votre message...
					</div>
					<Button size="icon" variant="ghost" className="ml-2 text-primary">
						<ArrowRight className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>
	)
}
