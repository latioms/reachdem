import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CampaignLists from './campaign-lists'

interface CampaignTabsProps {
  dictionary: {
    tabs: {
      sms: string;
      whatsapp: string;
    };
    messages: {
      noSmsCampaigns: string;
      whatsappInDevelopment: string;
    };
    [key: string]: any; // Allow additional properties
  };
}

export default function CampaignTabs({ dictionary }: CampaignTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-sm grid-cols-2">
          <TabsTrigger value="sms">{dictionary.tabs.sms}</TabsTrigger>
          <TabsTrigger value="whatsapp">{dictionary.tabs.whatsapp}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sms" className="mt-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground text-lg">
              {dictionary.messages.noSmsCampaigns}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="whatsapp" className="mt-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground text-lg">
              {dictionary.messages.whatsappInDevelopment}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
