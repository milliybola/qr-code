const API_BASE = "https://mytizim.uz";

export interface ProductImage {
  image: string;
  is_main: boolean;
  is_active: boolean;
}

export interface Product {
  id: number;
  uuid?: string;
  name: string;
  price: number;
  discount?: number;
  description?: string;
  is_active: boolean;
  is_available: boolean;
  is_new?: boolean;
  images?: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
  category_details?: {
    name?: string;
    logo?: string;
  };
  products: Product[];
}

export interface Partner {
  id?: number;
  uuid?: string;
  name: string;
  banner?: string;
  delivery_time?: string;
  rating?: number;
  review_count?: number;
  description?: string;
  is_open?: boolean;
  opening_hours?: string;
  working_hours?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(uuid: string): boolean {
  return UUID_RE.test(uuid);
}

function toHttps(url?: string): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export async function fetchPartner(uuid: string): Promise<Partner | null> {
  if (!isValidUuid(uuid)) return null;
  try {
    const res = await fetch(`${API_BASE}/partner/${uuid}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const partner = unwrap<Partner>(json);
    if (!partner || !partner.name) return null;
    return { ...partner, banner: toHttps(partner.banner) };
  } catch {
    return null;
  }
}

export async function fetchCategories(uuid: string): Promise<Category[]> {
  if (!isValidUuid(uuid)) return [];
  try {
    const res = await fetch(`${API_BASE}/partner/category/?partner=${uuid}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = unwrap<{ categories?: Category[] }>(json);
    const categories = data?.categories ?? [];

    return categories
      .filter((c) => c.is_active)
      .map((c) => ({
        ...c,
        products: (c.products ?? [])
          .filter((p) => p.is_active && p.is_available)
          .map((p) => ({ ...p, images: p.images?.map((img) => ({ ...img, image: toHttps(img.image)! })) })),
      }))
      .filter((c) => c.products.length > 0);
  } catch {
    return [];
  }
}

export function formatPrice(price: number): string {
  return `${Math.round(price).toLocaleString("uz-UZ")} so'm`;
}

export function mainImage(product: Product): string | undefined {
  const main = product.images?.find((img) => img.is_main && img.is_active);
  return main?.image ?? product.images?.find((img) => img.is_active)?.image;
}
