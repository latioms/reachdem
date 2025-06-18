'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { trackNavigationEvent } from '@/lib/tracking';

interface TrackedButtonProps extends ButtonProps {
  trackingName: string;
  trackingLocation?: string;
  trackingProperties?: Record<string, any>;
}

export function TrackedButton({
  trackingName,
  trackingLocation = 'unknown',
  trackingProperties = {},
  onClick,
  children,
  ...props
}: TrackedButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Track the button click
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

// Hook for tracking form submissions
export function useFormTracking() {
  const trackFormSubmission = (
    formName: string,
    success: boolean,
    formData?: Record<string, any>,
    error?: string
  ) => {
    trackNavigationEvent.buttonClick(`${formName}-submit`, 'form', {
      success,
      error: error || null,
      formData: formData || {},
      timestamp: new Date().toISOString(),
    });
  };

  const trackFormFieldInteraction = (
    formName: string,
    fieldName: string,
    action: 'focus' | 'blur' | 'change',
    value?: string
  ) => {
    // Only track if not sensitive data
    const isSensitiveField = ['password', 'credit_card', 'ssn', 'token'].some(
      sensitive => fieldName.toLowerCase().includes(sensitive)
    );

    trackNavigationEvent.buttonClick(`${formName}-field-${action}`, 'form-field', {
      fieldName,
      action,
      value: isSensitiveField ? '[REDACTED]' : value,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackFormSubmission,
    trackFormFieldInteraction,
  };
}
