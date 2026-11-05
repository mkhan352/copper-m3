import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/copper/catalog";

export function Hero({ products }: { products: Product[] }) {
  const [home, notes] = products;
  return (
    <section
      data-testid="hero"
      id="top"
      className="bg-secondary text-secondary-foreground"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
        <div className="space-y-6 text-center md:text-left">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            Copper State Labs
          </p>
          <h1 className="font-heading text-4xl leading-tight font-extrabold sm:text-5xl">
            Smart devices, refined in the Arizona sun.
          </h1>
          <p className="text-muted-foreground text-xl">
            From raw ideas to refined answers.
          </p>
          <Button asChild size="lg" className="px-8 text-base">
            <a href="#products">See products</a>
          </Button>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <Image
            src={home.cutout}
            alt={`${home.name}, a rounded fabric smart speaker with a copper base ring and round display`}
            width={1254}
            height={1254}
            priority
            sizes="(min-width: 768px) 28rem, 90vw"
            className="absolute top-0 left-0 h-auto w-[80%]"
          />
          <Image
            src={notes.cutout}
            alt={`${notes.name}, a brushed copper clip-on recorder with an amber light ring`}
            width={1254}
            height={1254}
            priority
            sizes="(min-width: 768px) 14rem, 45vw"
            className="absolute right-0 bottom-0 h-auto w-[45%] drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
