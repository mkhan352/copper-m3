import Image from "next/image";
import type { Product } from "@/lib/copper/catalog";

const STORIES: Record<string, { alt: string; caption: string }> = {
  "copper-home": {
    alt: "Copper Home on a stone kitchen counter, by a window looking out on the desert at sunset",
    caption:
      "Copper Home keeps an eye on monsoon storms, so the sprinklers don't have to.",
  },
  "copper-notes": {
    alt: "Copper Notes and its charging pad on a sunlit stone counter, with saguaros outside the window",
    caption:
      "Copper Notes turns a long meeting into decisions and action items.",
  },
};

export function Showcase({ products }: { products: Product[] }) {
  return (
    <section
      data-testid="showcase"
      id="showcase"
      className="bg-secondary/50 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-16 md:py-24">
        {products.map((product, i) => (
          <figure
            key={product.id}
            className="grid items-center gap-6 md:grid-cols-5 md:gap-10"
          >
            <Image
              src={product.lifestyle[0]}
              alt={STORIES[product.id]?.alt ?? `${product.name} at home`}
              width={1672}
              height={941}
              sizes="(min-width: 768px) 40rem, 100vw"
              className={`h-auto w-full rounded-2xl shadow-lg md:col-span-3 ${
                i % 2 === 1 ? "md:order-last" : ""
              }`}
            />
            <figcaption className="md:col-span-2">
              <h3 className="font-heading text-2xl font-bold">
                {product.name}
              </h3>
              <p className="text-muted-foreground mt-2 text-lg">
                {STORIES[product.id]?.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
