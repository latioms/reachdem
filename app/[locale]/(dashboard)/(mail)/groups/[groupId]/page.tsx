import React from 'react'
import { getDictionary } from '../../../../dictionaries'
import { getLang } from '@/lib/lang'
import { GroupDetailPage } from '@/components/groups/group-detail-page'
import { getGroupById } from '@/app/actions/mail/groups/getGroupById'
import { getContactsByGroup } from '@/app/actions/mail/group-contacts/getContactsByGroup'
import { redirect } from 'next/navigation'

export default async function GroupDetailRoute(props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
  const { groupId } = params
  const lang = await getLang()
  const dictionary = await getDictionary(lang)

  // Get group details
  const groupResult = await getGroupById(groupId)

  // If there's an error, redirect to the groups list
  if (!groupResult.success || !groupResult.group) {
    // Redirect to groups page
    redirect(`/${lang}/groups`)
  }

  // Get contacts for this group
  const contactsResult = await getContactsByGroup(groupId, 100, 0)

  return (
    <GroupDetailPage
      dictionary={dictionary}
      group={groupResult.group}
      contacts={contactsResult.success ? contactsResult.contacts : []}
    />
  )
}
