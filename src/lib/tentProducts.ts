import { fetchSupabaseRows } from './supabaseRest';

export type ProductItem = {
	additionalInfo?: string;
	badge?: string;
	capacity: string;
	category: string;
	description?: string;
	galleryImages: string[];
	href?: string;
	id: string;
	image: string;
	installTime: string;
	priceCents: number;
	size: string;
	title: string;
	variant?: string;
};

type ProductRow = Record<string, unknown>;

const getString = (row: ProductRow, keys: string[], fallback = '') => {
	for (const key of keys) {
		const value = row[key];

		if (typeof value === 'string' && value.trim()) {
			return value;
		}

		if (typeof value === 'number' && Number.isFinite(value)) {
			return String(value);
		}
	}

	return fallback;
};

const getPriceCents = (row: ProductRow) => {
	const cents = row.price_cents ?? row.priceCents;

	if (typeof cents === 'number' && Number.isFinite(cents)) {
		return Math.round(cents);
	}

	const euros = row.price ?? row.price_eur ?? row.priceEuro;

	if (typeof euros === 'number' && Number.isFinite(euros)) {
		return Math.round(euros * 100);
	}

	if (typeof euros === 'string') {
		const parsed = Number(euros.replace(',', '.').replace(/[^\d.]/g, ''));
		return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
	}

	return 0;
};

const getStringArray = (row: ProductRow, keys: string[]) => {
	for (const key of keys) {
		const value = row[key];

		if (Array.isArray(value)) {
			return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
		}

		if (typeof value === 'string' && value.trim()) {
			try {
				const parsed = JSON.parse(value);

				if (Array.isArray(parsed)) {
					return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
				}
			} catch {
				return value
					.split(',')
					.map((item) => item.trim())
					.filter(Boolean);
			}
		}
	}

	return [];
};

const sortRows = (rows: ProductRow[]) =>
	[...rows].sort((first, second) => {
		const firstOrder = Number(first.sort_order ?? first.order ?? 0);
		const secondOrder = Number(second.sort_order ?? second.order ?? 0);

		return firstOrder - secondOrder;
	});

const mapProductRow = (row: ProductRow): ProductItem | null => {
	const id = getString(row, ['id', 'slug', 'sku']);
	const title = getString(row, ['title', 'name']);
	const image = getString(row, ['image', 'image_url', 'imageUrl', 'thumbnail_url', 'thumbnailUrl']);

	if (!id || !title || !image) {
		return null;
	}

	return {
		additionalInfo: getString(row, ['additional_info', 'additionalInfo', 'extra_info', 'extraInfo']) || undefined,
		badge: getString(row, ['badge', 'label']) || undefined,
		capacity: getString(row, ['capacity', 'persons', 'guest_capacity'], 'Pēc pieprasījuma'),
		category: getString(row, ['category', 'type', 'product_type'], 'Teltis'),
		description: getString(row, ['description', 'long_description', 'details']) || undefined,
		galleryImages: Array.from(new Set([image, ...getStringArray(row, ['gallery_images', 'galleryImages', 'images', 'image_gallery'])])),
		href: getString(row, ['href', 'url'], '#kontakti'),
		id,
		image,
		installTime: getString(row, ['install_time', 'installTime', 'setup_time'], 'Uzstādīšanas laiks: pēc vienošanās'),
		priceCents: getPriceCents(row),
		size: getString(row, ['size', 'dimensions', 'area'], 'Pēc pieprasījuma'),
		title,
		variant: getString(row, ['variant', 'default_variant']) || undefined,
	};
};

export async function getProductsByPageSlug(pageSlug: string) {
	const tableName = import.meta.env.SUPABASE_PRODUCTS_TABLE || 'products';
	const rows = await fetchSupabaseRows<ProductRow>(tableName, {
		params: {
			is_active: 'eq.true',
			page_slug: `eq.${pageSlug}`,
			order: 'sort_order.asc',
		},
	});

	const products = sortRows(rows).map(mapProductRow).filter(Boolean) as ProductItem[];

	return products;
}

export async function getAllActiveProducts() {
	const tableName = import.meta.env.SUPABASE_PRODUCTS_TABLE || 'products';
	const rows = await fetchSupabaseRows<ProductRow>(tableName, {
		params: {
			is_active: 'eq.true',
			order: 'page_slug.asc,sort_order.asc',
		},
	});

	const products = sortRows(rows).map(mapProductRow).filter(Boolean) as ProductItem[];

	return products;
}

export async function getTentProducts() {
	return getProductsByPageSlug('teltis');
}
