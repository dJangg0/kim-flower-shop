import { defineField, defineType } from 'sanity';
import { PrimaryColorInput } from '../components/PrimaryColorInput';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  initialValue: {
    primaryColor: '#B14A66',
    showAnnouncement: false,
    showDailyHighlights: false,
    currency: 'PHP',
  },
  fields: [
    defineField({
      name: 'primaryColor',
      title: 'Primary color',
      description: 'Pick the accent color used across the storefront.',
      type: 'string',
      components: { input: PrimaryColorInput },
      validation: (rule) => rule.required().regex(/^#[0-9a-fA-F]{6}$/),
    }),
    defineField({
      name: 'currency',
      title: 'Store currency',
      description: 'Choose how product prices are displayed. Existing prices are not converted when this changes.',
      type: 'string',
      options: {
        list: [
          { title: 'Philippine peso (PHP)', value: 'PHP' },
          { title: 'Euro (EUR)', value: 'EUR' },
          { title: 'US dollar (USD)', value: 'USD' },
          { title: 'British pound (GBP)', value: 'GBP' },
        ],
      },
      initialValue: 'PHP',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'announcementText',
      title: 'Announcement text',
      type: 'string',
      description: 'Optional text for the storefront announcement bar.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'showAnnouncement',
      title: 'Show announcement bar',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'dailyHighlights',
      title: 'Highlights of the day',
      description: 'Short messages shown in a strip at the very top of the storefront. Add up to three.',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'showDailyHighlights',
      title: 'Show highlights of the day',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
