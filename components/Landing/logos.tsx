import React from 'react'
import Image from 'next/image'

const LOGOS: { src: string; alt: string; height: string; width?: string; external?: boolean }[] = [
	{
		src: 'Orange.png',
		alt: "Orange Cameroon",
		height: "h-12"
	},
	{
		src: 'mtn-black.png',
		alt: "MTN",
		height: "h-15"
	},
	{
		src: 'lowejo.svg',
		alt: "Lowejo",
		height: "h-7"
	},
	{
		src: 'https://eleven-public-cdn.elevenlabs.io/payloadcms/pwsc4vchsqt-ElevenLabsGrants.webp',
		alt: "ElevenLabs",
		height: "h-8",
		width: "w-36",
		external: true,
	},
];

interface LogosProps {
	dictionary?: any;
}

export default function Logos({ dictionary }: LogosProps) {
	return (
		<section className="relative overflow-hidden bg-muted/50 py-14">
			<div className="mx-auto text-center">
				<p className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
					{dictionary?.title}
				</p>
				<div
					className="relative overflow-hidden"
					style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
				>
					<div className="flex animate-marquee items-center gap-20 w-max">
						{[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, index) => (
							logo.external ? (
								/* eslint-disable-next-line @next/next/no-img-element */
								<img
									key={index}
									src={logo.src}
									alt={logo.alt}
									width={144}
									height={36}
									loading="lazy"
									className={`${logo.height} ${logo.width ?? ''} object-contain shrink-0 opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert`}
								/>
							) : (
								<Image
									key={index}
									src={`/images/${logo.src}`}
									alt={logo.alt}
									width={100}
									height={60}
									className={`${logo.height} shrink-0 opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert`}
								/>
							)
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
