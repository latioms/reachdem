"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type Feature = {
  title: string;
  description: string;
};

type PricingPlan = {
  name: string;
  price: string | { monthly: string; yearly: string };
  description: string;
  buttonText: string;
  buttonVariant?: "default" | "outline";
  features: Feature[];
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic Plan",
    price: "$0",
    description: "Ideal for individuals getting started with our service. No credit card required.",
    buttonText: "Start for Free",
    buttonVariant: "outline",
    features: [
      {
        title: "Limited access to features:",
        description: "3 users, 1 project, 1GB storage",
      },
      {
        title: "Basic support:",
        description: "Email support only for 30 days after signup",
      },
    ],
  },
  {
    name: "Standard Plan",
    price: { monthly: "$20", yearly: "$199" },
    description: "Perfect for small businesses looking to grow. Start with a 30-day free trial.",
    buttonText: "Try for Free",
    features: [
      {
        title: "Access to all standard features:",
        description: "10 users, 5 projects, 5GB storage",
      },
      {
        title: "Priority support:",
        description: "Email and phone support for 30 days after signup",
      },
    ],
  },
  {
    name: "Premium Plan",
    price: "Custom",
    description: "Best for large organizations with advanced needs. Contact us for a custom quote.",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    features: [
      {
        title: "Dedicated support:",
        description: "24/7 email and phone support",
      },
      {
        title: "Custom integrations:",
        description: "Tailored to your organization's needs",
      },
    ],
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (price: string | { monthly: string; yearly: string }) => {
    if (typeof price === "string") return price;
    return isYearly ? price.yearly : price.monthly;
  };

  return (
    <section className="py-32 px-4 lg:px-24">
      <div>
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-6 text-4xl font-bold text-pretty lg:text-6xl">
            Our affordable pricing
          </h2>
          <p className="text-muted-foreground lg:text-xl">
            Check out our pricing plans to find the best fit for you.
          </p>
        </div>
        <div className="mt-20 grid gap-10 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <div key={index}>
              <div className="flex flex-col justify-between gap-10 rounded-lg border p-6">
                <div>
                  <p className="mb-2 text-lg font-semibold">{plan.name}</p>
                  <p className="mb-4 text-4xl font-semibold">
                    {getPrice(plan.price)}
                    {typeof plan.price === "object" && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        per user
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <Button variant={plan.buttonVariant} className="w-full">
                  {plan.buttonText}
                </Button>
              </div>
              <ul className="mt-8 px-6">
                {plan.features.map((feature, featureIndex) => (
                  <>
                    <li key={featureIndex} className="flex gap-2">
                      <Check className="w-4" />
                      <p className="text-sm text-muted-foreground">
                        <span className="mr-1 font-semibold text-primary">
                          {feature.title}
                        </span>
                        {feature.description}
                      </p>
                    </li>
                    {featureIndex < plan.features.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
