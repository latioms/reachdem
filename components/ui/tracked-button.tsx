'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useDualTracking } from '@/hooks/use-dual-analytics';

interface TrackedButtonProps extends ButtonProps {
  trackingName: string;
  trackingLocation?: string;
  trackingProperties?: Record<string, unknown>;
}

export function TrackedButton({
  trackingName,
  trackingLocation = 'unknown',
  trackingProperties = {},
  onClick,
  children,
  ...props
}: TrackedButtonProps) {
  const { trackNavigationEvent } = useDualTracking();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Track the button click in both platforms
    trackNavigationEvent.buttonClick(trackingName, trackingLocation, {
      ...trackingProperties,
      buttonText: typeof children === 'string' ? children : trackingName,
    });

    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}

// Hook for tracking form submissions with dual analytics
export function useFormTracking() {
  const { trackFormEvent } = useDualTracking();
  const trackFormSubmission = (
    formName: string,
    success: boolean,
    formData?: Record<string, unknown>,
    error?: string
  ) => {
    trackFormEvent.submit(formName, success, formData, error);
  };

  const trackFormFieldInteraction = (
    formName: string,
    fieldName: string,
    action: 'focus' | 'blur' | 'change',
    value?: string
  ) => {
    trackFormEvent.fieldInteraction(formName, fieldName, action);
  };

  return {
    trackFormSubmission,
    trackFormFieldInteraction,
  };
}
