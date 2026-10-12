import { getProductInterestOptions } from '@/lib/db/queries'
import { ContactClient } from './ContactClient'

export const revalidate = 60 // ISR; admin edits also revalidate immediately

const DEFAULT_OPTIONS = ['Spices', 'Grains', 'Nuts & Dry Fruits', 'Cardamom', 'Stingless Bee Honey', 'Mango Pulp']

export default async function ContactPage() {
  const options = await getProductInterestOptions()
  return <ContactClient productOptions={options.length > 0 ? options : DEFAULT_OPTIONS} />
}
