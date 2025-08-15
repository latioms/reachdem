"use client"

import * as React from "react"
import { useId, useState } from "react"
import { Check, ChevronDownIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  value = [],
  onValueChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat trouvé.",
  multiple = true,
  disabled = false,
  className,
}: ComboboxProps) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => value.includes(option.value))
  }, [options, value])

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      const newValue = value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue]
      onValueChange?.(newValue)
    } else {
      onValueChange?.(value.includes(selectedValue) ? [] : [selectedValue])
      setOpen(false)
    }
  }

  const handleRemove = (optionValue: string) => {
    const newValue = value.filter((v) => v !== optionValue)
    onValueChange?.(newValue)
  }

  const displayText = React.useMemo(() => {
    if (selectedOptions.length === 0) {
      return placeholder
    }
    if (!multiple && selectedOptions.length === 1) {
      return selectedOptions[0].label
    }
    if (multiple && selectedOptions.length === 1) {
      return `${selectedOptions.length} sélectionné`
    }
    return `${selectedOptions.length} sélectionnés`
  }, [selectedOptions, placeholder, multiple])

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px] min-h-[40px] h-auto"
            disabled={disabled}
          >
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {multiple && selectedOptions.length > 0 ? (
                <>
                  {selectedOptions.slice(0, 2).map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="text-xs h-6"
                    >
                      {option.label}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(option.value)
                        }}
                      />
                    </Badge>
                  ))}
                  {selectedOptions.length > 2 && (
                    <Badge variant="secondary" className="text-xs h-6">
                      +{selectedOptions.length - 2} autres
                    </Badge>
                  )}
                </>
              ) : (
                <span className={cn("truncate", value.length === 0 && "text-muted-foreground")}>
                  {displayText}
                </span>
              )}
            </div>
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0 ml-2"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    {option.label}
                    {value.includes(option.value) && (
                      <Check size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
