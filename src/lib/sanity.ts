import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = import.meta.env.PUBLIC_SANITY_DATASET?.trim() || 'production';

const sanityClient = projectId && projectId !== 'your-project-id'
	? createClient({
			projectId,
			dataset,
			apiVersion: '2026-03-01',
			useCdn: true,
		})
	: null;

export interface Product {
	_id: string;
	name: string;
	description?: string;
	price?: number;
	image?: {
		asset?: {
			url?: string;
			metadata?: {
				lqip?: string;
				dimensions?: { width: number; height: number };
			};
		};
	};
}

export const currencyCodes = ['PHP', 'EUR', 'USD', 'GBP'] as const;
export type CurrencyCode = (typeof currencyCodes)[number];

export interface SiteSettings {
	primaryColor?: string;
	currency: CurrencyCode;
	announcementText?: string;
	showAnnouncement?: boolean;
}

type QueriedSiteSettings = Omit<Partial<SiteSettings>, 'currency'> & { currency?: string };

export const activeProductsQuery = `
	*[_type == "product" && isActive == true] | order(_createdAt desc) {
		_id,
		name,
		description,
		price,
		"image": image {
			"asset": asset->{
				url,
				metadata { lqip, dimensions { width, height } }
			}
		}
	}
`;

export const siteSettingsQuery = `
	*[_type == "siteSettings" && _id == "siteSettings"][0] {
		primaryColor,
		currency,
		announcementText,
		showAnnouncement
	}
`;

export async function getActiveProducts(): Promise<Product[]> {
	if (!sanityClient) return [];
	return sanityClient.fetch<Product[]>(activeProductsQuery);
}

const defaultSiteSettings: SiteSettings = {
	primaryColor: '#8D4F59',
	currency: 'PHP',
	announcementText: '',
	showAnnouncement: false,
};

export async function getSiteSettings(): Promise<SiteSettings> {
	if (!sanityClient) return defaultSiteSettings;

	try {
		const settings = await sanityClient.fetch<QueriedSiteSettings | null>(siteSettingsQuery);
		const currency = currencyCodes.find((code) => code === settings?.currency)
			?? defaultSiteSettings.currency;

		return { ...defaultSiteSettings, ...(settings ?? {}), currency };
	} catch (error) {
		console.error('Could not load Sanity site settings:', error);
		return defaultSiteSettings;
	}
}

export function getSanityImageUrl(url: string, width: number): string {
	const imageUrl = new URL(url);
	imageUrl.searchParams.set('w', String(width));
	imageUrl.searchParams.set('auto', 'format');
	imageUrl.searchParams.set('q', '85');
	return imageUrl.toString();
}
