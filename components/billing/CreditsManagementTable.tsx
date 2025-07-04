"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { RechargeModal } from "./RechargeModal"
import { getProjects } from '@/app/actions/SMS/project/getProjects'
import { Project } from '@/types/schema'

interface CreditsManagementTableProps {
  dictionary: any;
}

export default function CreditsManagementTable({ dictionary }: CreditsManagementTableProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await getProjects()
      console.log(response)
      if (!response.error && response.projects) {
        setProjects(response.projects)
      }
      setLoading(false)
    }

    fetchProjects()
  }, [])

  if (loading) {
    return <div>{dictionary.table.loading}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{dictionary.payAsYouGo}</h2>
      </div>
      <Card className="mb-8 rounded-t-sm">
        <CardHeader>
          <div className="flex items-center">
            <div>
              <CardDescription>{dictionary.rechargeCredits}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary.table.index}</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary.table.expCode}</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary.table.smsCredits}</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary.table.active}</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{dictionary.table.actions}</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {projects.map((project, index) => (
                  <tr key={project.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 text-left align-middle">{index + 1}</td>
                    <td className="p-4 text-left align-middle">{project.sender_name}</td>
                    <td className="p-4 text-left align-middle">{project.sms_credits}</td>
                    <td className="p-4 text-left align-middle">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        project.active === 'enabled'
                          ? 'bg-green-50 text-green-700 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-red-600/20'
                      }`}>
                        {project.active === 'enabled' ? dictionary.status.enabled : dictionary.status.disabled}
                      </span>
                    </td>
                    <td className="p-4 text-left align-middle">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant='outline' disabled={project.active !== 'enabled'}>{dictionary.table.recharge}</Button>
                        </DialogTrigger>
                        <RechargeModal projectId={project.id} dictionary={dictionary} />
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
