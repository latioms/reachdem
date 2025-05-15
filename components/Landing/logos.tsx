import React from 'react'

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
		src: 'vision-pub-blue.png',
		alt: "Vision Pub",
		height: "h-9"
	},
	{
		src: 'lowejo.svg',
		alt: "Lowejo",
		height: "h-7"
	},
];

export default function Logos() {
	return (
		<div className="mx-auto flex w-full flex-col items-center bg-muted">
			<div className="my-6 flex flex-col items-center gap-4 ">
				<p className="text-center text-sm text-muted-foreground">
					Soutenu depuis le debut par les meilleurs partenaires.
				</p>
				<div className="flex flex-wrap items-center justify-center gap-15 opacity-80">
					{LOGOS.map((logo, index) => (
						<img
							key={index}
							src={`/images/${logo.src}`}
							alt={logo.alt}
							className={`${logo.height} grayscale-100 transition-opacity hover:grayscale-0 hover:opacity-100`}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
