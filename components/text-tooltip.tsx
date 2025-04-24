import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface TextTooltipProps {
  text: string
  button: React.ReactNode
}

export function TextTooltip({ text, button }: TextTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center">
            {text}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

