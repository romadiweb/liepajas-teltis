const DEFAULT_SUPABASE_REST_URL = 'https://yafsrdvoqkrnhioaobth.supabase.co/rest/v1';

type SupabaseRequestOptions = {
	params?: Record<string, string>;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getSupabaseConfig = () => {
	const restUrl = import.meta.env.SUPABASE_REST_URL || import.meta.env.PUBLIC_SUPABASE_REST_URL || DEFAULT_SUPABASE_REST_URL;
	const apiKey =
		import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
		import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
		import.meta.env.SUPABASE_ANON_KEY ||
		import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

	return {
		apiKey,
		restUrl: trimTrailingSlash(restUrl),
	};
};

export async function fetchSupabaseRows<T>(tableName: string, options: SupabaseRequestOptions = {}) {
	const { apiKey, restUrl } = getSupabaseConfig();

	if (!apiKey || !tableName) {
		return [];
	}

	const url = new URL(`${restUrl}/${encodeURIComponent(tableName)}`);
	url.searchParams.set('select', '*');

	Object.entries(options.params ?? {}).forEach(([key, value]) => {
		url.searchParams.set(key, value);
	});

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			apikey: apiKey,
		},
	});

	if (!response.ok) {
		console.warn(`Supabase request failed for ${tableName}: ${response.status} ${response.statusText}`);
		return [];
	}

	const data = await response.json();
	return Array.isArray(data) ? (data as T[]) : [];
}
