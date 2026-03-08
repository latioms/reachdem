"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative overflow-hidden bg-primary py-24 sm:py-32">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-black/[0.06]" />
        <div className="absolute -left-12 -bottom-12 h-60 w-60 rounded-full bg-black/[0.06]" />
        <div className="absolute right-1/3 bottom-0 h-40 w-40 rounded-full bg-black/[0.04]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-24">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Ready to Reach Your Audience?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/70">
            Join thousands of businesses using ReachDem to send SMS and email
            campaigns that deliver results.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="group h-12 rounded-xl bg-[#09090b] px-8 text-base font-semibold text-white hover:bg-[#09090b]/90"
              asChild
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-primary-foreground/20 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
