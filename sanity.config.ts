import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'flower-shop',
  title: 'Kim Flower Shop',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('product').title('Products'),
            S.listItem()
              .title('On Sale')
              .id('onSaleProducts')
              .child(
                S.documentTypeList('product')
                  .title('On Sale')
                  .filter(
                    '_type == "product" && isActive == true && isOnSale == true && defined(price) && defined(salePrice) && salePrice >= 0 && salePrice < price',
                  )
                  .apiVersion('2026-03-01'),
              ),
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
});
