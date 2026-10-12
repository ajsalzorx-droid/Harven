import { getActiveProducts, getProductCategoryNames } from '@/lib/db/queries'
import { ProductsClient } from './ProductsClient'
import { MOCK_CATEGORIES } from './fallback-products'

export const revalidate = 60 // ISR; admin edits also revalidate immediately

const DEFAULT_TABS = ['Spices', 'Grains', 'Fresh Produce', 'Dry Fruits', 'Frozen']

export default async function ProductsPage() {
  const [dbProducts, dbCategories] = await Promise.all([getActiveProducts(), getProductCategoryNames()])

  // Map DB fields to the UI schema; fall back to the PDF list if the DB is empty
  const products = dbProducts.length > 0
    ? dbProducts.map((d) => ({
        id: d.id,
        name: d.name,
        img: d.image_url,
        description: d.description,
        category: d.category,
        tags: d.tags || [],
      }))
    : MOCK_CATEGORIES

  // Tabs: categories in the order they first appear in the (sorted) product list,
  // then any remaining managed categories that have no products yet.
  const categories = dbCategories.length > 0 ? dbCategories : DEFAULT_TABS
  const used = products.map((p) => p.category).filter(Boolean) as string[]
  const tabs = ['All', ...Array.from(new Set([...used, ...categories]))]

  return <ProductsClient initialProducts={products} tabs={tabs} />
}
