'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
    Form,
    FormField,
    FormDescription,
    FormControl, FormMessage,
    FormLabel,
    FormItem
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, ProjectInput } from "@/lib/validations/project";
import { createProject } from "@/app/actions/createProject";


import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogTitle, DialogContent } from "@radix-ui/react-dialog";

export function DialogForm(){
    const router = useRouter();

        // 1. Defining the form object
        const form = useForm<ProjectInput>({
            resolver: zodResolver(projectSchema),
            defaultValues: {
                sender_name: "",
            },
        });
    
        // 2. Defining the form submit function
        async function onSubmit(values: ProjectInput) {
           await createProject(values.sender_name).then((res: any) => {
                if (res.error) {
                    console.log(res.error);
                    return;
                }
                router.push("/en/dashboard");
            });
        }

    return (
    <Dialog>
        <DialogTitle>Creer un projet</DialogTitle>
        <DialogDescription>Vous devez creer un projet pour demarrer</DialogDescription>
        <DialogContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="sender_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Veillez entrez un nom de projet</FormLabel>
                            <FormControl>
                                <Input placeholder="ReachDem" {...field} />
                            </FormControl>
                            <FormDescription>
                                Il sera utilisé comme CODE EXPEDITEUR.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Créer un projet</Button>
            </form>
        </Form>
        </DialogContent>
    </Dialog>
    )
}

export default function ProjectPage() {
    const router = useRouter();

    // 1. Defining the form object
    const form = useForm<ProjectInput>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            sender_name: "",
        },
    });

    // 2. Defining the form submit function
    async function onSubmit(values: ProjectInput) {
       await createProject(values.sender_name).then((res: any) => {
            if (res.error) {
                console.log(res.error);
                return;
            }
            router.push("/en/dashboard");
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="sender_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Veillez entrez un nom de projet</FormLabel>
                            <FormControl>
                                <Input placeholder="ReachDem" {...field} />
                            </FormControl>
                            <FormDescription>
                                Il sera utilisé comme CODE EXPEDITEUR.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Créer un projet</Button>
            </form>
        </Form>
    );
       
}

 ;