import React from 'react'
import Image from 'next/image'

const LOGOS = [
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
							<Image
								key={index}
								src={`/images/${logo.src}`}
								alt={logo.alt}
								width={100}
								height={60}
								className={`${logo.height} shrink-0 opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0`}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
