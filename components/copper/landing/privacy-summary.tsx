import { ShieldCheckIcon } from "lucide-react";
import Image from "next/image";
import type { PrivacySummary as Privacy } from "@/lib/copper/catalog";

export function PrivacySummary({ privacy }: { privacy: Privacy }) {
  return (
    <section
      data-testid="privacy-summary"
      id="privacy"
      className="bg-accent text-accent-foreground scroll-mt-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-3 md:py-24">
        <div className="md:col-span-2">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Your privacy, in plain words
          </h2>
          <p className="mt-3 text-lg">
            How Copper handles your recordings under our {privacy.policy}{" "}
            privacy policy.
          </p>
          <ul className="mt-8 space-y-4">
            {privacy.points.map((point) => (
              <li key={point} className="flex gap-3">
                <ShieldCheckIcon
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/assets/brand/copper-mascot.png"
          alt="Copper the robot mascot waving and holding a clipboard"
          width={1254}
          height={1254}
          sizes="(min-width: 768px) 20rem, 60vw"
          className="mx-auto h-auto w-56 md:w-full"
        />
      </div>
    </section>
  );
}
