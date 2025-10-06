'use client'

import { useRef, useState, type ReactNode, type FormEvent } from 'react'
import {
	useDragControls,
	useMotionValue,
	useAnimate,
	motion,
} from 'framer-motion'

import { BubbleText } from '@/components/bubble-text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

type DragCloseDrawerProps = {
	open: boolean
	setOpen: (value: boolean) => void
	children: ReactNode
}

const DragCloseDrawer = ({ open, setOpen, children }: DragCloseDrawerProps) => {
	const [scope, animate] = useAnimate()
	const drawerRef = useRef<HTMLDivElement | null>(null)

	const y = useMotionValue(0)
	const controls = useDragControls()

	const handleClose = async () => {
		const overlay = scope.current
		const drawer = drawerRef.current
		const drawerHeight = drawer?.getBoundingClientRect().height ?? 0
		const yStart = typeof y.get() === 'number' ? y.get() : 0

		if (overlay) {
			await animate(overlay, {
				opacity: [1, 0],
			})
		}

		if (drawer) {
			await animate(drawer, {
				y: [yStart, drawerHeight],
			})
		}

		y.set(0)
		setOpen(false)
	}

	return (
		<>
			{open && (
				<motion.div
					ref={scope}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					onClick={handleClose}
					className="fixed inset-0 z-50 bg-neutral-950/70"
				>
					<motion.div
						id="drawer"
						ref={drawerRef}
						onClick={(event) => event.stopPropagation()}
						initial={{ y: '100%' }}
						animate={{ y: '0%' }}
						transition={{ ease: 'easeInOut' }}
						className="absolute bottom-0 h-[75vh] w-full overflow-hidden rounded-t-3xl bg-neutral-900"
						style={{ y }}
						drag="y"
						dragControls={controls}
						onDragEnd={() => {
							if (y.get() >= 100) {
								handleClose()
							}
						}}
						dragListener={false}
						dragConstraints={{ top: 0, bottom: 0 }}
						dragElastic={{ top: 0, bottom: 0.5 }}
					>
						<div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-neutral-900 p-4">
							<button
								onPointerDown={(event) => {
									controls.start(event)
								}}
								className="h-2 w-14 cursor-grab touch-none rounded-full bg-neutral-700 active:cursor-grabbing"
							/>
						</div>
						<div className="relative z-0 h-full overflow-y-auto p-6 pt-16">
							{children}
						</div>
					</motion.div>
				</motion.div>
			)}
		</>
	)
}

const CookingPage = () => {
	const [open, setOpen] = useState(false)
	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [successOpen, setSuccessOpen] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string>('Merci pour votre inscription !')

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)

		const normalizedEmail = email.trim().toLowerCase()
		if (!normalizedEmail) {
			setError('Veuillez renseigner votre adresse e-mail.')
			return
		}
		const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/i
		if (!emailRegex.test(normalizedEmail)) {
			setError('Cette adresse e-mail ne semble pas valide.')
			return
		}

		setIsSubmitting(true)
		try {
			const response = await fetch('/api/newsletter', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: normalizedEmail }),
			})

			const data = (await response.json().catch(() => null)) as
				| { success?: boolean; alreadySubscribed?: boolean; error?: string }
				| null

			if (!response.ok || !data?.success) {
				throw new Error(data?.error ?? "Impossible d'enregistrer votre inscription.")
			}

			setSuccessMessage(
				data.alreadySubscribed
					? 'Vous êtes déjà inscrit(e) à notre newsletter. Merci de rester connecté(e).'
					: 'Merci pour votre inscription ! Nous vous préviendrons dès que ReachDem revient en ligne.'
			)
			setSuccessOpen(true)
			setEmail('')
			setOpen(false)
		} catch (submissionError) {
			const message =
				submissionError instanceof Error
					? submissionError.message
					: "Impossible d'enregistrer votre inscription pour le moment."
			setError(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="flex h-screen flex-col items-center justify-center space-y-6 bg-neutral-950 text-neutral-100">
			<BubbleText text="We are cooking." />
			<Button variant="outline" onClick={() => setOpen(true)}>
				ReachDem
			</Button>
			<DragCloseDrawer open={open} setOpen={setOpen}>
				<div className="mx-auto max-w-2xl space-y-4 text-neutral-300">
					<h2 className="text-3xl font-semibold text-neutral-100">Une nouvelle expérience arrive bientôt.</h2>
					<p>
						Suite a vos retours, nous avons décidé de repenser entièrement ReachDem pour vous offrir une expérience plus
						fluide, intuitive et puissante. Cette Nouvelle version sera conçue pour mieux répondre à vos besoins et ainsi, vous aider à
						mieux vous connecter avec vos clients.
						Cela comportera une interface utilisateur repensée, des nouvelles fonctionnalités et 
						une performance accrue pour booster votre productivité.
					</p>

					<p>
						Vos comptes, crédits et données actuels resteront inchangés et seront automatiquement transférés vers la nouvelle version à son lancement.
					</p>
					<p>
						L&rsquo;interface de connexion et l’application seront temporairement indisponibles lors de la transition. Mais si vous souhaitez urgemment accéder à votre compte,
						n&rsquo;hésitez pas à nous contacter via le <a href="https://wa.me/237233472836" className='underline underline-offset-2 font-mono text-blue-500'>support</a>, nous serons ravis de vous aider.
					</p>
					<form onSubmit={handleSubmit} className="space-y-3 pt-4" noValidate>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Input
								type="email"
								placeholder="Entrez votre email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="flex-1 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
								disabled={isSubmitting}
								required
								aria-label="Adresse e-mail"
							/>
							<Button
								type="submit"
								className="sm:w-auto"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Inscription…' : 'S’inscrire'}
							</Button>
						</div>
						<p className="text-sm text-neutral-400">
							Souscrivez pour être informé du lancement.
						</p>
						{error && (
							<p className="text-sm text-red-400" role="alert" aria-live="assertive">
								{error}
							</p>
						)}
					</form>
				</div>
			</DragCloseDrawer>
			<Dialog open={successOpen} onOpenChange={setSuccessOpen}>
				<DialogContent className="bg-neutral-900 text-neutral-100">
					<DialogHeader>
						<DialogTitle>Merci !</DialogTitle>
						<DialogDescription className="text-neutral-300">
							{successMessage}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSuccessOpen(false)}>
							Fermer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default CookingPage