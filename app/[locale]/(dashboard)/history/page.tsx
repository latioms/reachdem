import React from 'react'
import { MessagesHistoryTable } from '@/components/history/messages-history-table'

export default function page() {
  return (
    <section className='py-15'>
      <h1 className='text-2xl font-semibold m-5'>Historique</h1>
      <MessagesHistoryTable />
    </section>
  )
}
