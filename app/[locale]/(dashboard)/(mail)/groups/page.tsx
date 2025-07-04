import React from 'react'
import { GroupsClientPage } from '@/components/groups'
import { getDictionary } from '../../../dictionaries'
import { getLang } from '@/lib/lang'

export default async function GroupsPage() {
  const lang = await getLang();
  const dictionary = await getDictionary(lang);

  return <GroupsClientPage dictionary={dictionary} />
}
