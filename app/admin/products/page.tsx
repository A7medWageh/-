import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Pencil } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { AdminGuard } from '@/components/admin/admin-guard'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user?.id)
    .single()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  const isOwner = adminUser?.role === 'owner'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">المنتجات</h1>
          {isOwner && (
            <Link href="/admin/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة منتج
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>جميع المنتجات ({products?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!products || products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">لا توجد منتجات</p>
                <Link href="/admin/products/new">
                  <Button className="mt-4">إضافة أول منتج</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name_ar}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.name_ar}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category?.name_ar || 'بدون فئة'} • المخزون: {product.stock}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {product.is_featured && (
                        <Badge>مميز</Badge>
                      )}
                      {!product.is_active && (
                        <Badge variant="secondary">غير نشط</Badge>
                      )}
                    </div>

                    <div className="text-left">
                      <p className="font-bold text-primary">
                        {formatPrice(product.discount_price || product.price)}
                      </p>
                      {product.discount_price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name_ar} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
