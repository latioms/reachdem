"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { UserPlus, Upload, Rocket } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in seconds. No credit card required. Get instant access to all features with a free trial.",
  },
  {
    number: "02",
    icon: Upload,
    title: "Import Your Contacts",
    description:
      "Upload your contact list via CSV, or add contacts manually. Organize them into smart segments.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch & Track",
    description:
      "Send SMS and email campaigns to your audience. Monitor delivery, opens, and clicks in real time.",
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative overflow-hidden bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-24">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </span>
          <h2
            className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Up and Running in 3&nbsp;Steps
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-12">
          {/* Connector line (desktop only) */}
          <div
            className="pointer-events-none absolute top-7 left-[16.67%] right-[16.67%] hidden h-px md:block"
            aria-hidden="true"
          >
            <div className="h-full w-full border-t-2 border-dashed border-border" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * (i + 1) }}
            >
              {/* Number badge */}
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-background font-display text-lg font-bold text-primary shadow-sm">
                {step.number}
              </div>

              <div className="mt-6 flex justify-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>

              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-base text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
