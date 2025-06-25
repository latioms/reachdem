"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

const smsPlans: PricingPlan[] = [
  {
    name: "Free SMS",
    price: "Free",
    description: "15 SMS included then 25 F per additional SMS.",
    buttonText: "Start for Free",
    buttonVariant: "outline",
    features: [
      {
        title: "Included messages:",
        description: "15 SMS",
      },
      {
        title: "Pay as you go:",
        description: "25 F per SMS after the first 15",
      },
    ],
  },
  {
    name: "Starter SMS",
    price: "18 F / SMS",
    description: "For orders of 1,000 SMS or more.",
    buttonText: "Choose Plan",
    features: [
      {
        title: "Volume pricing:",
        description: "18 F per SMS (min. 1000)",
      },
      {
        title: "API access:",
        description: "Send through our SMS API",
      },
    ],
  },
  {
    name: "Pro SMS",
    price: "15 F / SMS",
    description: "Reduced rate for 10,000 SMS or more.",
    buttonText: "Get Started",
    features: [
      {
        title: "Volume pricing:",
        description: "15 F per SMS (min. 10,000)",
      },
      {
        title: "Technical support:",
        description: "Access to our support team",
      },
    ],
  },
  {
    name: "Custom SMS",
    price: "Custom",
    description: "Need more? Contact us to discuss your pricing.",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    features: [
      {
        title: "Negotiated rates:",
        description: "Tailored to your volume",
      },
      {
        title: "Dedicated support:",
        description: "Personalised assistance",
      },
    ],
  },
];

const mailPlans: PricingPlan[] = [
  {
    name: "Free Mail",
    price: "Free",
    description: "Send up to 50,000 emails per day with custom domain.",
    buttonText: "Start for Free",
    buttonVariant: "outline",
    features: [
      {
        title: "Daily limit:",
        description: "50k emails",
      },
      {
        title: "Custom domain:",
        description: "Use your own sender domain",
      },
    ],
  },
  {
    name: "Basic Mail",
    price: "8 F / email",
    description: "Up to 300,000 emails per day.",
    buttonText: "Choose Plan",
    features: [
      {
        title: "Daily limit:",
        description: "300k emails",
      },
      {
        title: "Analytics:",
        description: "Basic stats and tracking",
      },
    ],
  },
  {
    name: "Advanced Mail",
    price: "Custom",
    description: "Enhanced features for large senders (up to 300k/day).",
    buttonText: "Get Started",
    features: [
      {
        title: "Priority sending:",
        description: "Improved deliverability",
      },
      {
        title: "Advanced analytics:",
        description: "Detailed reporting tools",
      },
    ],
  },
  {
    name: "Custom Mail",
    price: "Custom",
    description: "Contact us to negotiate a tailored offer.",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    features: [
      {
        title: "Flexible volume:",
        description: "More than 300k emails per day",
      },
      {
        title: "Dedicated support:",
        description: "Personalised assistance",
      },
    ],
  },
];

const Pricing = () => {  const getPrice = (price: string | { monthly: string; yearly: string }) => {
    if (typeof price === "string") return price;
    return price.monthly;
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

          <h3 className="mt-20 mb-6 text-2xl font-semibold text-center">SMS Plans</h3>
          <div className="mb-20 grid gap-10 md:grid-cols-3">
            {smsPlans.map((plan, index) => (
              <div key={index}>
                <div className="flex flex-col justify-between gap-10 rounded-lg border p-6">
                  <div>
                    <p className="mb-2 text-lg font-semibold">{plan.name}</p>
                    <p className="mb-4 text-4xl font-semibold">
                      {getPrice(plan.price)}
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

          <h3 className="mb-6 text-2xl font-semibold text-center">Mail Plans</h3>
          <div className="grid gap-10 md:grid-cols-3">
            {mailPlans.map((plan, index) => (
              <div key={index}>
                <div className="flex flex-col justify-between gap-10 rounded-lg border p-6">
                  <div>
                    <p className="mb-2 text-lg font-semibold">{plan.name}</p>
                    <p className="mb-4 text-4xl font-semibold">
                      {getPrice(plan.price)}
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
            ))}          </div>
        </div>
      </section>
  );
};

export default Pricing;
