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
      isActive: 'isActive',
    },
    prepare({ title, media, price, isActive }) {
      const formattedPrice = typeof price === 'number' ? price.toFixed(2) : 'Price not set';

      return {
        title: title || 'Untitled product',
        subtitle: `${formattedPrice}${isActive === false ? ' · Hidden' : ''}`,
        media,
      };
    },
  },
});
