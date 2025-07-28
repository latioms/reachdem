import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CampaignLists from './campaign-lists'

export default function CampaignTabs() {
  return (
    <div className="w-full">
      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-sm grid-cols-2">
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sms" className="mt-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground text-lg">
              Aucune campagne SMS pour l'instant
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="whatsapp" className="mt-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground text-lg">
              Cette fonctionnalité est en cours de développement
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
