"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { type Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ProductFiltersProps {
  categories: Category[]
  currentCategory?: string
  currentSort?: string
}

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <Label className="text-sm font-medium mb-3 block">الفئات</Label>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          <Button
            variant={!currentCategory ? 'default' : 'ghost'}
            size="sm"
            className="justify-start"
            onClick={() => updateFilter('category', null)}
          >
            الكل
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={currentCategory === category.slug ? 'default' : 'ghost'}
              size="sm"
              className="justify-start"
              onClick={() => updateFilter('category', category.slug)}
            >
              {category.name_ar}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <Label className="text-sm font-medium mb-3 block">ترتيب حسب</Label>
        <Select
          value={currentSort || 'newest'}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
            <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
