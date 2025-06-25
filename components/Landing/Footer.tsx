import { FaFacebook, FaLinkedin, FaXTwitter, FaTelegram } from "react-icons/fa6";
import LocaleSwitcher from "../ui/LocaleSwitcher";

interface FooterDictionary {
	description: string;
	emailPlaceholder: string;
	subscribe: string;
	products: {
		title: string;
		sms: string;
		email: string;
		campaigns: string;
		contacts: string;
		api: string;
	};
	support: {
		title: string;
		pricing: string;
		faq: string;
		demo: string;
		contact: string;
	};
	company: {
		title: string;
		about: string;
		terms: string;
		privacy: string;
	};
	social: {
		twitter: string;
		facebook: string;
		linkedin: string;
		telegram: string;
	};
	copyright: string;
	learnMore: string;
}

interface FooterProps {
	dictionary: FooterDictionary;
	locale: string;
}

export const Footer = ({ 
	dictionary: dict = {
		description: "Building communication solutions for businesses and individuals around the globe.",
		emailPlaceholder: "Your email",
		subscribe: "Subscribe",
		products: {
			title: "Products",
			sms: "SMS",
			email: "Email",
			campaigns: "Campaigns",
			contacts: "Contacts",
			api: "API"
		},
		support: {
			title: "Support",
			pricing: "Pricing",
			faq: "FAQ",
			demo: "Demo",
			contact: "Contact"
		},
		company: {
			title: "Company",
			about: "About",
			terms: "Terms of Service",
			privacy: "Privacy Policy"
		},
		social: {
			twitter: "Twitter",
			facebook: "Facebook",
			linkedin: "LinkedIn",
			telegram: "Telegram"
		},
		copyright: "© {year} ReachDem. All rights reserved.",
		learnMore: "Learn more about us"
	},
	locale = "en" 
}: FooterProps) => {
	const navigation = [
		{
			title: dict.products.title,
			links: [
				{ name: dict.products.sms, href: `/${locale}/pricing` },
				{ name: dict.products.email, href: `/${locale}/pricing` },
				{ name: dict.products.campaigns, href: `/${locale}/campaigns` },
				{ name: dict.products.contacts, href: `/${locale}/contacts` },
				{ name: dict.products.api, href: "#" },
			],
		},
		{
			title: dict.support.title,
			links: [
				{ name: dict.support.pricing, href: `/${locale}/pricing` },
				{ name: dict.support.faq, href: `/${locale}/faq` },
				{ name: dict.support.demo, href: `/${locale}/demo` },
				{ name: dict.support.contact, href: `/${locale}/about` },
			],
		},
		{
			title: dict.company.title,
			links: [
				{ name: dict.company.about, href: `/${locale}/about` },
				{ name: dict.company.terms, href: "#" },
				{ name: dict.company.privacy, href: "#" },
			],
		},
	];

	const socialLinks = [
		{ name: dict.social.twitter, icon: FaXTwitter, href: "https://twitter.com" },
		{ name: dict.social.facebook, icon: FaFacebook, href: "https://facebook.com/" },
		{ name: dict.social.linkedin, icon: FaLinkedin, href: "https://www.linkedin.com/company/101800400" },
		{ name: dict.social.telegram, icon: FaTelegram, href: "https://t.me/reachdem" },
	];
	return (
		<section className="bg-background py-12 sm:py-16 md:py-24">
			<div className="container mx-auto max-w-full px-4 sm:px-6 lg:px-24">
				{/* Logo and newsletter section */}
				<div className="mb-10 flex flex-col items-start justify-between gap-10 border-b pb-10 sm:mb-16 sm:pb-12 md:flex-row">
					<div className="w-full max-w-full sm:max-w-sm">						<a href={`/${locale}`}>
							<img
								src="/images/reachdem.png"
								alt="ReachDem logo"
								className="mb-6 h-8 dark:invert"
							/>
						</a><p className="mb-8 text-base text-muted-foreground">
							{dict.description}
						</p>

						{/* Newsletter subscription */}
						<div className="flex w-full max-w-full flex-col gap-3 sm:max-w-md sm:flex-row">
							<input
								type="email"
								placeholder={dict.emailPlaceholder}
								className="flex h-12 flex-1 rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-sm"
							/>
							<button className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 py-2 text-base font-medium whitespace-nowrap text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-10 sm:px-4 sm:text-sm">
								{dict.subscribe}
							</button>
						</div>
					</div>

					{/* Navigation Section */}
					<div className="w-full border-t pt-8 sm:border-t-0 sm:pt-0 md:w-1/2">
						<nav className="grid w-full grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 md:w-auto md:grid-cols-3">
							{navigation.map((section) => (
								<div key={section.title} className="min-w-[140px]">
									<h2 className="mb-4 text-lg font-semibold">
										{section.title}
									</h2>
									<ul className="space-y-3.5">
										{section.links.map((link) => (
											<li key={link.name}>
												<a
													href={link.href}
													className="inline-block py-1 text-muted-foreground transition-colors duration-200 hover:text-foreground active:text-primary"
												>
													{link.name}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
					<div className="order-1 mb-6 flex w-full items-center justify-center gap-6 sm:justify-start md:order-2 md:mb-0 md:w-auto">
						{/* Language Switcher */}
						<div className="mr-4">
							<LocaleSwitcher />
						</div>

						{socialLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								aria-label={`Visit our ${link.name} page`}
								className="rounded-full p-3 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:bg-accent/70"
								rel="noopener noreferrer"
								target="_blank"
							>
								<link.icon className="h-6 w-6 sm:h-5 sm:w-5" />
							</a>
						))}
					</div>					{/* Copyright - Below on mobile, left on desktop */}
					<p className="order-2 text-center text-sm text-muted-foreground sm:text-left md:order-1">
						{dict.copyright.replace("{year}", new Date().getFullYear().toString())}{" "}
						<a
							href={`/${locale}/about`}
							className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
						>
							{dict.learnMore}
						</a>
					</p>
				</div>
			</div>
		</section>
	);
};
