import { defineField, defineType } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Enter the amount in the store currency selected under Site Settings.',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'isOnSale',
      title: 'On sale',
      description: 'Show this product in the On Sale section with its discounted price.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale price',
      description: 'Enter the discounted amount in the store currency.',
      type: 'number',
      hidden: ({ document }) => (document?.isOnSale as boolean | undefined) !== true,
      validation: (rule) =>
        rule.custom((value, context) => {
          const document = context.document as
            | { isOnSale?: boolean; price?: number }
            | undefined;

          if (document?.isOnSale !== true) return true;
          if (typeof value !== 'number') return 'Enter a sale price.';
          if (value < 0) return 'Sale price cannot be negative.';
          if (typeof document.price !== 'number') return 'Set the regular price first.';

          return value < document.price || 'Sale price must be lower than the regular price.';
        }),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      description: 'Turn off to hide this product from the storefront.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      price: 'price',
      salePrice: 'salePrice',
      isOnSale: 'isOnSale',
      isActive: 'isActive',
    },
    prepare({ title, media, price, salePrice, isOnSale, isActive }) {
      const formattedPrice = typeof price === 'number' ? price.toFixed(2) : 'Price not set';
      const saleLabel = isOnSale === true
        && typeof price === 'number'
        && typeof salePrice === 'number'
        && salePrice >= 0
        && salePrice < price
        ? `${formattedPrice} → ${salePrice.toFixed(2)} sale`
        : formattedPrice;

      return {
        title: title || 'Untitled product',
        subtitle: `${saleLabel}${isActive === false ? ' · Hidden' : ''}`,
        media,
      };
    },
  },
});
