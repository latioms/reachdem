'use client'
import React from 'react'
import Image from 'next/image'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, registerSchema } from "@/lib/validations/auth";
import { toast } from "sonner";
import createAccount from "@/app/actions/createAccount";
import { useRouter } from 'next/navigation';
import { CheckSquare, FolderKanban, Users } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface RegisterFormProps {
	dictionary: any;
}

export function RegisterForm({ dictionary }: RegisterFormProps) {
	const [isLoading, setIsLoading] = React.useState(false);
	const [showEmailForm, setShowEmailForm] = React.useState(false);
	const router = useRouter();
	const params = useParams();

	// Extract translations with fallbacks
	const t = dictionary?.auth?.register || {};
	const locale = params.locale || 'en';

	const form = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: RegisterInput) => {
		setIsLoading(true);
		try {
			const result = await createAccount(data.name, data.email, data.password);

			if (result.success) {
				toast.success(t.toast?.success || "Compte créé avec succès!");
				router.push(`/${locale}`);
			} else {
				toast.error(result.error);
			}
		} catch (error: any) {
			toast.error(error.message || t.toast?.error || "Une erreur est survenue");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="bg-muted/60 2xl:bg-background px-8 py-32">
			<div className="container mx-auto lg:max-w-[1400px] lg:px-0 2xl:px-8">
				<div className="border-border lg:bg-muted/30 grid rounded-2xl lg:grid-cols-2 2xl:border 2xl:py-10">
					<div className="mx-auto flex max-w-xl flex-col justify-between lg:px-20">
						<div className="lg:mt-24">
							<div className="flex flex-col gap-2">
								<h1 className="text-2xl font-bold">
									{t.title || "Create your account today"}
								</h1>
								<p className="text-muted-foreground font-medium">
									{t.subtitle || "15 SMS gratuits inclus. Plans évolutifs avec tarifs dégressifs selon le volume."}
								</p>
							</div>

							{!showEmailForm ? (
								<div className="mt-16 flex flex-col gap-6">
									<div className="flex flex-col gap-2">
										<Button onClick={() => setShowEmailForm(true)}>
											{t.continueWithEmail || "Continue with Email"}
										</Button>
									</div>
									<div className="flex items-center gap-2">
										<Separator className="flex-1" />
										<span className="text-muted-foreground text-sm">{t.or || "or"}</span>
										<Separator className="flex-1" />
									</div>
									<Button variant="outline" disabled>
										<FcGoogle className="mr-2" />
										{t.continueWithGoogle || "Continue with Google"}
									</Button>

								</div>
							) : (
								<div className="mt-8">
									<Form {...form}>
										<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
											<FormField
												control={form.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t.form?.name || "Name"}</FormLabel>
														<FormControl>
															<Input {...field} placeholder={t.form?.namePlaceholder || "Enter your name"} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t.form?.email || "Email"}</FormLabel>
														<FormControl>
															<Input {...field} type="email" placeholder={t.form?.emailPlaceholder || "Enter your email"} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="password"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t.form?.password || "Password"}</FormLabel>
														<FormControl>
															<Input {...field} type="password" placeholder={t.form?.passwordPlaceholder || "Enter your password"} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<div className="flex gap-2 pt-2">
												<Button
													type="button"
													variant="outline"
													onClick={() => setShowEmailForm(false)}
													className="flex-1"
													disabled={isLoading}
												>
													{t.form?.back || "Back"}
												</Button>
												<Button
													type="submit"
													className="flex-1"
													disabled={isLoading}
												>
													{isLoading ? (t.form?.creating || "Création du compte...") : (t.form?.signUp || "Sign up")}
												</Button>
											</div>
										</form>
									</Form>
								</div>
							)}
						</div>

						<div className="mt-10">
							<p className="text-muted-foreground text-sm">
								{t.alreadyUser || "Already a user?"}{" "}
								<Link href={`/${locale}/login`} className="text-primary">
									{t.loginLink || "Log in"}
								</Link>
							</p>
							<p className="text-muted-foreground text-sm">
								{t.terms || "By continuing, you agree to our"}{" "}
								<a href="/#" className="text-primary">
									{t.termsLink || "Terms"}{" "}
								</a>
								{t.and || "and"}{" "}
								<a href="/#" className="text-primary">
									{t.privacyLink || "Privacy Policy."}
								</a>
							</p>
						</div>
					</div>

					<div className="border-border lg:bg-muted/60 rounded-l-2xl pt-14 lg:border-y lg:border-l lg:py-8 lg:pl-12">
						<div className="mx-auto flex max-w-xl justify-between gap-4 lg:mx-0 lg:max-w-none lg:justify-start lg:gap-8">
							<div className="flex flex-row items-center gap-4">
								<img
									src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/ph-monthly.svg"
									alt="g2 monthly"
									className="h-10"
								/>
							</div>
						</div>
						<div className="border-border bg-muted mt-6 hidden rounded-l-xl border-y border-l border-dashed py-1.5 pl-1.5 lg:block">
							<Image
								src="/images/send-sms-client.png"
								alt="placeholder"
								width={600}
								height={450}
								className="border-border max-h-[450px] w-full rounded-l-xl border-y border-l object-cover"
							/>
						</div>
						<div className="mr-3 mt-8 hidden grid-cols-3 gap-3 lg:grid">
							<div className='space-y-1'>
								<FolderKanban className="mb-2 size-4" />
								<p className="text-sm font-medium">{t.features?.organize?.title || "Organize your campaigns"}</p>
								<p className="text-muted-foreground text-xs">
									{t.features?.organize?.description || "Keep all your SMS and email campaigns organized in one centralized dashboard."}
								</p>
							</div>
							<div className='space-y-1'>
								<CheckSquare className="mb-2 size-4" />
								<p className="text-sm font-medium">{t.features?.track?.title || "Track delivery status"}</p>
								<p className="text-muted-foreground text-xs">
									{t.features?.track?.description || "Monitor message delivery and engagement across all your campaigns."}
								</p>
							</div>
							<div className='space-y-1'>
								<Users className="mb-2 size-4" />
								<p className="text-sm font-medium">
									{t.features?.manage?.title || "Manage your contacts"}
								</p>
								<p className="text-muted-foreground text-xs">
									{t.features?.manage?.description || "Import, segment and organize your contacts for better targeting."}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
