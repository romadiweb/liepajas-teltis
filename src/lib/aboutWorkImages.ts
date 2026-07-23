import { fetchSupabaseRows } from './supabaseRest';

export type AboutWorkImage = {
	alt: string;
	image: string;
	title: string;
};

type AboutWorkImageRow = {
	alt?: string | null;
	image?: string | null;
	image_url?: string | null;
	imageUrl?: string | null;
	is_active?: boolean | null;
	sort_order?: number | null;
	title?: string | null;
	url?: string | null;
};

const fallbackAboutWorkImages: AboutWorkImage[] = [
	{
		alt: 'Divas baltas pagoda teltis vakara pasākumā ar stāvgaldiem',
		image:
			'https://yafsrdvoqkrnhioaobth.supabase.co/storage/v1/object/public/site-images/musu-darbi/pagoda-teltis-vakara.jpeg',
		title: 'Pagoda teltis vakara pasākumam',
	},
	{
		alt: 'Lielas pasākumu telts interjers ar zaļu grīdas segumu un baltām sienām',
		image:
			'https://yafsrdvoqkrnhioaobth.supabase.co/storage/v1/object/public/site-images/musu-darbi/telts-interjers-zals-segums.jpeg',
		title: 'Telts interjers ar zaļu grīdas segumu',
	},
	{
		alt: 'Liela balta pasākumu telts parkā ar zaļu grīdas segumu',
		image:
			'https://yafsrdvoqkrnhioaobth.supabase.co/storage/v1/object/public/site-images/musu-darbi/liela-telts-parka.jpeg',
		title: 'Liela pasākumu telts parkā',
	},
	{
		alt: 'Balta pasākuma telts ar sarkaniem stāvgaldiem un sēdvietām Liepājā',
		image:
			'https://yafsrdvoqkrnhioaobth.supabase.co/storage/v1/object/public/site-images/musu-darbi/pasakuma-telts-liepaja-2027.jpeg',
		title: 'Pasākuma telts Liepājā',
	},
];

const getString = (row: AboutWorkImageRow, keys: (keyof AboutWorkImageRow)[]) => {
	for (const key of keys) {
		const value = row[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}

	return '';
};

const mapAboutWorkImage = (row: AboutWorkImageRow): AboutWorkImage | null => {
	const image = getString(row, ['image_url', 'imageUrl', 'image', 'url']);
	if (!image) return null;

	const title = getString(row, ['title']);
	const alt = getString(row, ['alt']) || title || 'Liepājas Teltis paveiktais darbs';

	return {
		alt,
		image,
		title,
	};
};

export async function getAboutWorkImages() {
	const tableName = import.meta.env.SUPABASE_ABOUT_WORK_IMAGES_TABLE || 'about_work_images';
	const rows = await fetchSupabaseRows<AboutWorkImageRow>(tableName, {
		params: {
			is_active: 'eq.true',
			order: 'sort_order.asc,created_at.asc',
		},
	});
	const images = rows.map(mapAboutWorkImage).filter((image): image is AboutWorkImage => Boolean(image));

	return images.length > 0 ? images : fallbackAboutWorkImages;
}
