import { SVGProps, useId } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

 const About = () => {
  return (
    <section className="py-20z px-4 lg:px-24">
      {/* Hero Section */}
      <section className="relative container max-w-5xl py-10 md:py-12 lg:py-15">
        <div className="">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            ReachDem: Révolutionner
            <br />
            la communication par SMS.
          </h1>
          <p className="mt-4 max-w-2xl text-2xl text-muted-foreground md:text-3xl">
            Conçu par Latioms.co pour simplifier et démocratiser l&apos;envoi de SMS professionnels au Cameroun et bientôt en Afrique centrale.
          </p>
        </div>
        {/* Background decoration */}
        <>
          <div className="absolute inset-0 z-[-1] -translate-y-1/2 blur-[100px] will-change-transform">
            <div className="bg-gradient-1/25 absolute top-0 right-0 h-[400px] w-[800px] -translate-x-1/5 rounded-full" />
            <div className="bg-gradient-2/10 absolute top-0 right-0 size-[400px] rounded-full" />
          </div>
          <div className="absolute -inset-40 z-[-1] [mask-image:radial-gradient(circle_at_center,black_0%,black_20%,transparent_80%)]">
            <PlusSigns className="h-full w-full text-foreground/[0.05]" />
          </div>
        </>
      </section>

      {/* Stats Section */}
      <section className="container max-w-5xl border-y py-5">
        <h2 className="font-mono text-sm font-semibold tracking-widest text-accent-foreground">
          Latioms.co en chiffres
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              +113
            </h3>
            <p className="mt-1 font-medium text-muted-foreground">Personnes formés</p>
          </div>
          <div>
            <h3 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              +100
            </h3>
            <p className="mt-1 font-medium text-muted-foreground">Projets réalisés</p>
          </div>
          <div>
            <h3 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              +50M
            </h3>
            <p className="mt-1 font-medium text-muted-foreground">
              Chiffre d&apos;affaires (FCFA)
            </p>
          </div>
          <div>
            <h3 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              N°1
            </h3>
            <p className="mt-1 font-medium text-muted-foreground">
              Innovation SMS en Afrique Centrale
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container max-w-5xl py-10 md:py-12 lg:py-15">
        <div className="max-w-2xl space-y-5 md:space-y-8 lg:space-y-10">
          <p className="text-lg">
            ReachDem est né d&apos;une vision claire : rendre la communication par SMS accessible, efficace et puissante pour toutes les entreprises. Latioms.co, fort de son expérience dans la création de solutions SaaS innovantes, a identifié un besoin crucial pour un outil de campagne SMS moderne et adapté aux réalités du marché local.
          </p>

          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            Notre mission : démocratiser l&apos;accès à des outils de communication performants.
          </h2>
          <p className="text-lg">
            Nous croyons que chaque entreprise, quelle que soit sa taille, mérite des outils capables de propulser sa croissance. ReachDem incarne cet engagement, en offrant une plateforme intuitive et robuste, conçue pour simplifier la gestion de campagnes SMS et maximiser leur impact.
          </p>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="my-5 pb-10 md:my-8 md:pb-12 lg:my-12 lg:pb-15">
        <Carousel
          opts={{
            align: "start",
          }}
        >
          <CarouselContent className="-ml-4">
            <CarouselItem className="basis-[80%] lg:basis-1/3 xl:basis-[40%]">
              <div className="relative h-[330px] lg:h-[440px] xl:h-[600px]">
                <img
                  src="/images/homme-phone.jpg"
                  alt="Main tenant un téléphone"
                  className="aspect square w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[80%] lg:basis-1/3 xl:basis-[40%]">
              <div className="relative h-[330px] lg:h-[440px] xl:h-[600px]">
                <img
                  src="/images/pommette-noire-entreprise.jpg" 
                  alt="Femme souriante travaillant sur ordinateur portable"
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[80%] lg:basis-1/3 xl:basis-[40%]">
              <div className="relative h-[330px] lg:h-[440px] xl:h-[600px]">
                <img
                  src="/images/woman-phone-student.jpg"
                  alt="Femme souriante regardant son téléphone"
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </section>

      {/* CoreAPI Section (Renamed to Latioms.co Expertise) */}
      <section className="container">
        <div className="mr-0 ml-auto max-w-2xl space-y-5 md:space-y-8 lg:space-y-10">
          <p className="text-lg">
            Latioms.co, la société mère de ReachDem, est spécialisée dans la création de projets informatiques sur mesure, notamment des solutions SaaS, et dans la formation de talents dans le domaine de l&apos;informatique. Notre expertise nous permet de développer des outils performants et adaptés aux besoins spécifiques de nos utilisateurs.
          </p>

          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            Une approche centrée sur l&apos;innovation et la formation.
          </h2>

          <p className="text-lg">
            Avec une solide expérience dans la réalisation de projets d&apos;envergure et la formation de plus d&apos;une centaine de professionnels, Latioms.co s&apos;engage à fournir des solutions qui font la différence. ReachDem est le fruit de cette passion pour l&apos;innovation et de notre volonté de contribuer au développement numérique.
          </p>
        </div>
      </section>

      {/* Founding Team Section (Focus on Latioms.co) */}
      <section className="container py-10 md:py-12 lg:py-15">
        <div className="grid gap-5 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="order-2 md:order-1">
            <h2 className="text-4xl font-semibold tracking-tight md:text-4xl">
              Fondé par Latioms.co
            </h2>
            <p className="mt-5 text-lg md:mt-6">
              ReachDem est un projet ambitieux porté par Latioms.co. Notre expertise dans la création de SaaS et la formation en informatique nous a permis de concevoir une plateforme SMS robuste et intuitive. Nous sommes dédiés à l&apos;innovation continue pour offrir les meilleurs outils de communication à nos clients au Cameroun et au-delà. Notre objectif est de simplifier vos campagnes SMS et de maximiser votre portée.
            </p>
          </div>
          <img
            src="/images/LATIOMS.CO.svg"
            alt="Latioms.co"
            width={480}
            height={400}
            className="order-1 shadow-xl object-cover md:order-2"
          />
        </div>
      </section>
    </section>
  );
};

interface PlusSignsProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

const PlusSigns = ({ className, ...props }: PlusSignsProps) => {
  const GAP = 16;
  const STROKE_WIDTH = 1;
  const PLUS_SIZE = 6;
  const id = useId();
  const patternId = `plus-pattern-${id}`;

  return (
    <svg width={GAP * 2} height={GAP * 2} className={className} {...props}>
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={GAP}
          height={GAP}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={GAP / 2}
            y1={(GAP - PLUS_SIZE) / 2}
            x2={GAP / 2}
            y2={(GAP + PLUS_SIZE) / 2}
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
          />
          <line
            x1={(GAP - PLUS_SIZE) / 2}
            y1={GAP / 2}
            x2={(GAP + PLUS_SIZE) / 2}
            y2={GAP / 2}
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};


export default About;