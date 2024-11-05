export enum HnSiteMapEnumChangefreq {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  ALWAYS = 'always',
  HOURLY = 'hourly',
  WEEKLY = 'weekly',
  YEARLY = 'yearly',
  NEVER = 'never',
}

export interface HnSitemapItemBase {
  lastmod?: string; // format: YYYY-MM-DD
  changefreq?: HnSiteMapEnumChangefreq;
  priority?: number;
  url: string;
}
