import Image from "next/image";
import { formatUsd, type Product } from "@/lib/copper/catalog";

// Brand colors for each product color name in the catalog.
const SWATCHES: Record<string, string> = {
  "Polished Copper": "#B87333",
  "Brushed Copper": "#B87333",
  "Patina Teal": "#4A8C82",
  "Desert Sand": "#EFE3D0",
  "Night Sky": "#1C2333",
};

export function ProductsSection({ products }: { products: Product[] }) {
  return (
    <section
      data-testid="products"
      id="products"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-24"
    >
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">
          Meet the family
        </h2>
        <p className="text-muted-foreground mt-3 text-lg">
          Two devices, one assistant: Copper.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {products.map((product) => (
          <article
            key={product.id}
            data-testid="product-card"
            data-product={product.id}
            className="bg-card ring-foreground/10 flex flex-col overflow-hidden rounded-2xl ring-1"
          >
            <div className="bg-secondary flex justify-center p-6">
              <Image
                src={product.cutout}
                alt={`${product.name} ${product.type}`}
                width={1254}
                height={1254}
                sizes="(min-width: 768px) 16rem, 60vw"
                className="h-auto w-56 sm:w-64"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="font-heading text-2xl font-bold">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground capitalize">
                    {product.type}
                  </p>
                </div>
                <p className="text-primary font-heading text-3xl font-extrabold">
                  {formatUsd(product.priceUsd)}
                </p>
              </div>
              <ul className="space-y-3">
                {product.features.map((feature) => (
                  <li key={feature.name}>
                    <span className="font-semibold">{feature.name}.</span>{" "}
                    <span className="text-muted-foreground">
                      {feature.description}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center gap-3 pt-2">
                <span className="text-muted-foreground text-sm">
                  Available in
                </span>
                <ul className="flex gap-2">
                  {product.colors.map((color) => (
                    <li key={color} title={color}>
                      <span
                        className="ring-foreground/20 block size-6 rounded-full ring-1"
                        style={{ backgroundColor: SWATCHES[color] }}
                      />
                      <span className="sr-only">{color}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
