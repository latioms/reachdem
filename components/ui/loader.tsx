'use client'

import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
}

export default function Loader({ className = '', size = 'md' }: LoaderProps) {
  return (
    <div className={`flex items-center justify-center min-h-[100px] ${className}`}>
      <div className={sizeClasses[size]}>
        <DotLottieReact
          src="/images/reachdem-loader.lottie"
          autoplay
        />
      </div>
    </div>
  )
}

// Loading wrapper component for pages
export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" />
    </div>
  )
}
