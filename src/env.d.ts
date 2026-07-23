/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly PUBLIC_SUPABASE_ANON_KEY?: string;
	readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
	readonly PUBLIC_SUPABASE_REST_URL?: string;
	readonly SUPABASE_ABOUT_WORK_IMAGES_TABLE?: string;
	readonly SUPABASE_ANON_KEY?: string;
	readonly SUPABASE_PRODUCTS_TABLE?: string;
	readonly SUPABASE_PUBLISHABLE_KEY?: string;
	readonly SUPABASE_REST_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
	LiepajasCart: {
		addItem: (
			item: {
				endDate?: string;
				id: string;
				image: string;
				priceCents: number;
				productId?: string;
				productPath?: string;
				quantity?: number;
				size?: string;
				startDate?: string;
				title: string;
				variant?: string;
			},
			options?: { open?: boolean },
		) => void;
		close: () => void;
		getItems: () => Array<{
			endDate?: string;
			id: string;
			image: string;
			priceCents: number;
			productId?: string;
			productPath?: string;
			quantity: number;
			size?: string;
			startDate?: string;
			title: string;
			variant?: string;
		}>;
		open: () => void;
		openEditor: (id: string) => void;
		removeItem: (id: string) => void;
		updateQuantity: (id: string, quantity: number) => void;
	};
	LiepajasProductModal?: {
		openByProductId: (
			productId: string,
			options?: {
				cartItemId?: string;
				endDate?: string;
				quantity?: number;
				startDate?: string;
			},
		) => boolean;
	};
}
