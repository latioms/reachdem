"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

interface HeroProps {
  dictionary?: any;
}

export default function Hero({ dictionary }: HeroProps) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#09090b]">
      {/* Grain overlay */}
      <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Ambient glow shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[100px] animate-float" />
        <div className="absolute -left-20 bottom-1/3 h-80 w-80 rounded-full bg-primary/5 blur-[80px] animate-float [animation-delay:3s]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-24 pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/60 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                {dictionary?.newFeature}
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              {dictionary?.title}
              <br />
              <span className="text-primary">{dictionary?.titleSpan}</span>
            </motion.h1>

            <motion.p
              className="max-w-md text-lg leading-relaxed text-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {dictionary?.subtitle}
            </motion.p>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              <Button
                size="lg"
                className="group h-12 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/register">
                  {dictionary?.startButton}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-transparent px-8 text-base text-white hover:bg-white/5 hover:text-white"
                asChild
              >
                <Link href="/pricing">
                  {dictionary?.starTour || "View Pricing"}
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center gap-5 text-sm text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {dictionary?.trial}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {dictionary?.noCard}
              </span>
            </motion.div>
          </div>

          {/* Right: Phone Mockup */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <PhoneMockup />
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-8 border-t border-white/[0.06] pt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          {[
            { value: "10K+", label: "Messages Daily" },
            { value: "99.9%", label: "Delivery Rate" },
            { value: "150+", label: "Countries" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl font-bold text-white sm:text-3xl" style={{ fontVariantNumeric: "tabular-nums" }}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-white/30">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function PhoneMockup() {
  const [messages, setMessages] = useState<{ id: number; text: string; time: string }[]>([])
  const [cycle, setCycle] = useState(0)
  const nextMessageId = useRef(0)

  useEffect(() => {
    const allMessages = [
      { text: "Hello! Your order #12345 has been shipped! \ud83d\udce6", time: "09:30" },
      { text: "Hi John, your clothes are ready.\nTam Pressing.", time: "09:31" },
      { text: "Your package arrives tomorrow, 10am\u201312pm.", time: "09:32" },
    ]

    let idx = 0
    let restartTimeout: ReturnType<typeof setTimeout> | null = null
    setMessages([])

    const interval = setInterval(() => {
      if (idx < allMessages.length) {
        const message = allMessages[idx]
        setMessages((prev) => [...prev, { id: nextMessageId.current++, ...message }])
        idx++
      } else {
        clearInterval(interval)
        restartTimeout = setTimeout(() => setCycle((c) => c + 1), 4000)
      }
    }, 1200)

    return () => {
      clearInterval(interval)
      if (restartTimeout) {
        clearTimeout(restartTimeout)
      }
    }
  }, [cycle])

  return (
    <div className="relative">
      {/* Glow behind phone */}
      <div
        className="absolute -inset-12 rounded-[4rem] bg-primary/10 blur-[60px] animate-pulse-glow"
        aria-hidden="true"
      />

      {/* Device frame */}
      <div className="relative mx-auto w-[280px] h-[580px] rounded-[3rem] border-[12px] border-[#1f1f23] bg-[#111113] shadow-2xl shadow-black/50 ring-1 ring-white/[0.05] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 flex justify-center z-20" aria-hidden="true">
          <div className="h-6 w-32 bg-[#111113] rounded-b-2xl" />
        </div>

        {/* Screen */}
        <div className="absolute inset-0 bg-white flex flex-col">
          {/* Header */}
          <div className="relative z-10 flex items-center justify-center bg-primary py-4 shadow-sm">
            <span className="text-sm font-semibold text-primary-foreground tracking-wide">
              ReachDem
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-[#f0f0f0] p-3 shadow-sm">
                    <p className="text-[13px] leading-snug text-[#1a1a1a] whitespace-pre-line">{msg.text}</p>
                    <p className="mt-1 text-[10px] text-[#999] text-right">{msg.time}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="border-t border-[#e5e5e5] bg-white p-3 flex items-center gap-2">
            <div className="flex-1 rounded-full bg-[#f5f5f5] px-4 py-2 text-[13px] text-[#999]">
              Type a message&hellip;
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary" aria-hidden="true">
              <ArrowRight className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
