"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { MessageSquare, Mail, Users, Link2 } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "SMS Campaigns",
    description:
      "Send personalized bulk SMS to thousands of contacts instantly. Schedule, target, and track delivery in real time.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description:
      "Craft beautiful email campaigns with our intuitive builder. Templates, personalization, and analytics built in.",
    accent: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Users,
    title: "Contact Management",
    description:
      "Organize your audience with smart segments, tags, and filters. Import from CSV or sync with your tools.",
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Link2,
    title: "Link Shortener",
    description:
      "Shorten, brand, and track every link you share. See click analytics and geographic data in real time.",
    accent: "bg-orange-500/10 text-orange-500",
  },
]

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-24">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Platform
          </span>
          <h2
            className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Everything You Need to Reach Your Audience
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One platform for SMS, email, contacts, and links. Built for speed and simplicity.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04]"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.accent} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
