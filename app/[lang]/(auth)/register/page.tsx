import React from 'react'
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


function page() {
    return (
        <section className="py-32">
            <div className="mx-auto flex justify-center p-6">
                <div className="grid lg:grid-cols-2">
                    <div className="py-10">
                        <div className="mx-auto my-auto flex h-full w-full max-w-md flex-col justify-center gap-4 p-6">
                            <div className="ite flex flex-col pb-6">
                                <p className="mb-2 text-3xl font-bold">Signup</p>
                                <p className="text-muted-foreground">
                                    Start your 30-day free trial.
                                </p>
                            </div>
                            <div className="w-full rounded-md bg-background">
                                <div>
                                    <div className="grid gap-4">
                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Enter your name"
                                                required
                                            />
                                        </div>

                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="mt-2 w-full">
                                            Get Started
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mx-auto mt-3 flex justify-center gap-1 text-sm text-muted-foreground">
                                <p>Already have an account?</p>
                                <a
                                    href="/login"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Log in
                                </a>
                            </div>
                        </div>
                    </div>

                    <img
                        src="https://shadcnblocks.com/images/block/placeholder-1.svg"
                        alt="placeholder"
                        className="hidden h-full max-h-screen object-cover lg:block"
                    />
                </div>
            </div>
        </section>
    )
}

export default page