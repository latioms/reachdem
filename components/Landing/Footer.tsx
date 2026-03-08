import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaLinkedin, FaXTwitter, FaTelegram } from "react-icons/fa6";
import LocaleSwitcher from "../ui/LocaleSwitcher";

const navigation = [
	{
		title: "Products",
		links: [
			{ name: "SMS", href: "/pricing" },
			{ name: "Email", href: "/pricing" },
			{ name: "Campaigns", href: "/campaigns" },
			{ name: "Contacts", href: "/contacts" },
			{ name: "API", href: "#" },
		],
	},
	{
		title: "Support",
		links: [
			{ name: "Pricing", href: "/pricing" },
			{ name: "FAQ", href: "/faq" },
			{ name: "Demo", href: "/demo" },
			{ name: "Contact", href: "/about" },
		],
	},
	{
		title: "Company",
		links: [
			{ name: "About", href: "/about" },
			{ name: "Terms of Service", href: "#" },
			{ name: "Privacy Policy", href: "#" },
		],
	},
];

const socialLinks = [
	{ name: "Twitter", icon: FaXTwitter, href: "https://twitter.com" },
	{ name: "Facebook", icon: FaFacebook, href: "https://facebook.com/" },
	{ name: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/company/101800400" },
	{ name: "Telegram", icon: FaTelegram, href: "https://t.me/reachdem" },
];

export const Footer = () => {
	return (
		<footer className="relative overflow-hidden bg-[#09090b] text-white">
			{/* Grain overlay */}
			<div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />

			<div className="container relative z-10 mx-auto max-w-full px-4 sm:px-6 lg:px-24 pt-16 pb-8 sm:pt-20">
				{/* Top: Brand + Nav */}
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
					{/* Brand & newsletter */}
					<div className="max-w-md">
						<Link href="/" className="inline-block">
							<Image
								src="/images/reachdem.png"
								alt="ReachDem logo"
								width={70}
								height={32}
								className="h-8 invert"
							/>
						</Link>
						<p className="mt-4 text-base leading-relaxed text-white/50">
							Building communication solutions for businesses and individuals
							around the globe. Send SMS and emails efficiently with our platform.
						</p>

						{/* Newsletter */}
						<div className="mt-6 flex flex-col gap-3 sm:flex-row">
							<input
								type="email"
								placeholder="Your email&hellip;"
								autoComplete="email"
								spellCheck={false}
								className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
							/>
							<button
								type="button"
								className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
							>
								Subscribe
							</button>
						</div>
					</div>

					{/* Navigation */}
					<nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						{navigation.map((section) => (
							<div key={section.title}>
								<h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
									{section.title}
								</h3>
								<ul className="mt-4 space-y-3">
									{section.links.map((link) => (
										<li key={link.name}>
											<Link
												href={link.href}
												className="text-sm text-white/40 transition-colors duration-200 hover:text-white"
											>
												{link.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</div>

				{/* Bottom bar */}
				<div className="mt-12 border-t border-white/[0.06] pt-8">
					<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
						{/* Left: language + copyright */}
						<div className="flex items-center gap-4">
							<LocaleSwitcher />
							<p className="text-sm text-white/30">
								&copy; {new Date().getFullYear()} ReachDem. All rights reserved.
							</p>
						</div>

						{/* Center: ElevenLabs badge */}
						<a
							href="https://elevenlabs.io/startup-grants"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-opacity duration-200 hover:opacity-80"
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src="https://eleven-public-cdn.elevenlabs.io/payloadcms/pwsc4vchsqt-ElevenLabsGrants.webp"
								alt="ElevenLabs Startup Grants"
								width={180}
								height={48}
								loading="lazy"
								className="h-10 w-auto invert brightness-200"
							/>
						</a>

						{/* Right: social */}
						<div className="flex items-center gap-1">
							{socialLinks.map((link) => (
								<a
									key={link.name}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Visit our ${link.name} page`}
									className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors duration-200 hover:bg-white/5 hover:text-white"
								>
									<link.icon className="h-4 w-4" />
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};
