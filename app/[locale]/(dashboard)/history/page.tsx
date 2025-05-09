import React from 'react'
import { MessagesHistoryTable } from '@/components/history/messages-history-table'
import { getDictionary } from '../../dictionaries'
import { getLang } from '@/lib/lang'

export default async function HistoryPage() {
  const lang = await getLang();
  const t = await getDictionary(lang);

  return (
    <section className='py-15'>
      <h1 className='text-2xl font-semibold m-5'>{t.history.title}</h1>
      <MessagesHistoryTable dictionary={t.history} />
    </section>
  )
}
