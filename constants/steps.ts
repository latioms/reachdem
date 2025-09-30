interface Step {
  title: string
  short_description: string
  full_description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  media?: {
    type: "image" | "video"
    src: string
    alt?: string
  }
}

export const steps: Step[] = [
  {
    title: "Bienvenue sur ReachDem",
    short_description: "Découvrez notre plateforme SMS",
    full_description: "Bienvenue sur ReachDem, votre solution pour atteindre vos clients partout, n'importe quand via SMS.",
    media: {
      type: "image",
      src: "/images/reachdem.jpg",
      alt: "ReachDem welcome",
    },
  },
  {
    title: "Envoi de SMS Simplifié",
    short_description: "Une interface intuitive pour vos campagnes",
    full_description: "Notre interface simple vous permet d'envoyer des SMS à vos clients en quelques clics. Importez vos contacts, rédigez votre message et envoyez !",
    action: {
      label: "Essayer maintenant",
      href: "/register",
    },
    media: {
      type: "image",
      src: "/images/Step3.png",
      alt: "SMS dashboard",
    },
  },
  {
    title: "Gestion des Projets",
    short_description: "Organisez vos campagnes SMS",
    full_description: "Créez des projets pour organiser vos campagnes SMS et suivre vos communications avec différents groupes de clients.",
    media: {
      type: "image",
      src: "/images/Step1.png",
      alt: "Project management",
    },
  },
  {
    title: "Suivez vos Performances",
    short_description: "Analyses et statistiques détaillées",
    full_description: "Accédez à des statistiques détaillées sur vos campagnes SMS : taux de livraison, meilleurs moments d'envoi, et plus encore.",
    media: {
      type: "image",
      src: "/images/Step2.png",
      alt: "Analytics dashboard",
    },
  },
]