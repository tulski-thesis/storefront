import medusaRequest from "../medusa-fetch"
import {
  StoreGetProductsParams,
  Product,
  ProductCategory,
  ProductCollection,
} from "@medusajs/medusa"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"

export type ProductCategoryWithChildren = Omit<
  ProductCategory,
  "category_children"
> & {
  category_children: ProductCategory[]
}

/**
 * Fetches a product by handle, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param handle (string) - The handle of the product to retrieve
 * @returns (array) - An array of products (should only be one)
 */
export async function getProductByHandle(
  handle: string
): Promise<{ products: PricedProduct[] }> {
  const { products } = await medusaRequest("GET", "/products", {
    query: {
      handle,
    },
  })
    .then((res) => res.body)
    .catch((err) => {
      throw err
    })

  return {
    products,
  }
}

/**
 * Fetches a list of products, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param pageParam (number) - The offset of the products to retrieve
 * @param queryParams (object) - The query parameters to pass to the API
 * @returns 'response' (object) - An object containing the products and the next page offset
 * @returns 'nextPage' (number) - The offset of the next page of products
 */
export async function getProductsList({
  pageParam = 0,
  queryParams,
}: {
  pageParam?: number
  queryParams: StoreGetProductsParams
}): Promise<{
  response: { products: PricedProduct[]; count: number }
  nextPage: number
}> {
  const limit = queryParams.limit || 24

  const { products, count, nextPage } = await medusaRequest(
    "GET",
    "/products",
    {
      query: {
        limit,
        offset: pageParam,
        ...queryParams,
      },
    }
  )
    .then((res) => res.body)
    .catch((err) => {
      throw err
    })

  return {
    response: { products, count },
    nextPage,
  }
}

/**
 * Fetches a list of collections, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param offset (number) - The offset of the collections to retrieve (default: 0
 * @returns collections (array) - An array of collections
 * @returns count (number) - The total number of collections
 */
export async function getCollectionsList(
  offset: number = 0
): Promise<{ collections: ProductCollection[]; count: number }> {
  const { collections, count } = await medusaRequest("GET", "/collections", {
    query: {
      offset,
    },
  })
    .then((res) => res.body)
    .catch((err) => {
      throw err
    })

  return {
    collections,
    count,
  }
}

/**
 * Fetches a collection by handle, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param handle  (string) - The handle of the collection to retrieve
 * @returns collections (array) - An array of collections (should only be one)
 * @returns response (object) - An object containing the products and the number of products in the collection
 * @returns nextPage (number) - The offset of the next page of products
 */
export async function getCollectionByHandle(handle: string): Promise<{
  collections: ProductCollection[]
  response: { products: Product[]; count: number }
  nextPage: number
}> {
  const data = await medusaRequest("GET", "/collections", {
    query: {
      handle: [handle],
    },
  })
    .then((res) => res.body)
    .catch((err) => {
      throw err
    })

  return data
}

/**
 * Fetches a list of products in a collection, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param pageParam (number) - The offset of the products to retrieve
 * @param handle (string) - The handle of the collection to retrieve
 * @param cartId (string) - The ID of the cart
 * @returns response (object) - An object containing the products and the number of products in the collection
 * @returns nextPage (number) - The offset of the next page of products
 */
export async function getProductsByCollectionHandle({
  pageParam = 0,
  handle,
  cartId,
  currencyCode,
}: {
  pageParam?: number
  handle: string
  cartId?: string
  currencyCode?: string
}): Promise<{
  response: { products: PricedProduct[]; count: number }
  nextPage: number
}> {
  const { id } = await getCollectionByHandle(handle).then(
    (res) => res.collections[0]
  )

  const { response, nextPage } = await getProductsList({
    pageParam,
    queryParams: { collection_id: [id], cart_id: cartId },
  })
    .then((res) => res)
    .catch((err) => {
      throw err
    })

  return {
    response,
    nextPage,
  }
}

/**
 * Fetches a list of categories, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param offset (number) - The offset of the categories to retrieve (default: 0
 * @param limit (number) - The limit of the categories to retrieve (default: 100)
 * @returns product_categories (array) - An array of product_categories
 * @returns count (number) - The total number of categories
 * @returns nextPage (number) - The offset of the next page of categories
 */
export async function getCategoriesList(
  offset: number = 0,
  limit?: number
): Promise<{
  product_categories: ProductCategoryWithChildren[]
  count: number
}> {
  const { product_categories, count } = await medusaRequest(
    "GET",
    "/product-categories",
    {
      query: {
        offset,
        limit,
      },
    }
  )
    .then((res) => res.body)
    .catch((err) => {
      throw err
    })

  return {
    product_categories,
    count,
  }
}

/**
 * Fetches a category by handle, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param categoryHandle  (string) - The handle of the category to retrieve
 * @returns collections (array) - An array of categories (should only be one)
 * @returns response (object) - An object containing the products and the number of products in the category
 * @returns nextPage (number) - The offset of the next page of products
 */
export async function getCategoryByHandle(categoryHandle: string[]): Promise<{
  product_categories: ProductCategoryWithChildren[]
}> {
  const handles = categoryHandle.map((handle: string, index: number) =>
    categoryHandle.slice(0, index + 1).join("/")
  )

  const product_categories = [] as ProductCategoryWithChildren[]

  for (const handle of handles) {
    await medusaRequest("GET", "/product-categories", {
      query: {
        handle,
      },
    })
      .then(({ body }) => {
        product_categories.push(body.product_categories[0])
      })
      .catch((err) => {
        throw err
      })
  }

  return {
    product_categories,
  }
}

/**
 * Fetches a list of products in a collection, using the Medusa API or the Medusa Product Module, depending on the feature flag.
 * @param pageParam (number) - The offset of the products to retrieve
 * @param handle (string) - The handle of the collection to retrieve
 * @param cartId (string) - The ID of the cart
 * @returns response (object) - An object containing the products and the number of products in the collection
 * @returns nextPage (number) - The offset of the next page of products
 */
export async function getProductsByCategoryHandle({
  pageParam = 0,
  handle,
  cartId,
  currencyCode,
}: {
  pageParam?: number
  handle: string
  cartId?: string
  currencyCode?: string
}): Promise<{
  response: { products: PricedProduct[]; count: number }
  nextPage: number
}> {
  const { id } = await getCategoryByHandle([handle]).then(
    (res) => res.product_categories[0]
  )

  const { response, nextPage } = await getProductsList({
    pageParam,
    queryParams: { category_id: [id], cart_id: cartId },
  })
    .then((res) => res)
    .catch((err) => {
      throw err
    })

  return {
    response,
    nextPage,
  }
}
