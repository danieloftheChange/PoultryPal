"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Collapsible({
    children,
    defaultOpen = false,
}: {
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    return <CollapsiblePrimitive.Root defaultOpen={defaultOpen}>{children}</CollapsiblePrimitive.Root>;
}

export function CollapsibleTrigger({
    title,
    className,
    asChild,
    children,
}: {
    title: string;
    className?: string;
    asChild?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <CollapsiblePrimitive.Trigger asChild={asChild} className={cn("flex w-full items-center justify-between rounded-lg bg-gray-100 p-2 text-left", className)}>
            {asChild ? (
                children
            ) : (
                <>
                    {title}
                    <ChevronDown className="transition-transform data-[state=open]:rotate-180 data-[state=closed]:rotate-0" />
                </>
            )}
        </CollapsiblePrimitive.Trigger>
    );
}

export function CollapsibleContent({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <CollapsiblePrimitive.Content className={cn("mt-2", className)}>{children}</CollapsiblePrimitive.Content>;
}