import { CheckIcon, MinusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatMemory,
  formatNotesHours,
  formatUsd,
  type Plan,
} from "@/lib/copper/catalog";
import { cn } from "@/lib/utils";

export function PlusPricing({ plans }: { plans: Plan[] }) {
  return (
    <section
      data-testid="plus-pricing"
      id="plus"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-24"
    >
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">
          Copper Plus
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-lg">
          Refine your answers: the smartest AI and the longest memory, for every
          Copper device in your home.
        </p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const plus = plan.refinedAnswers;
          return (
            <div
              key={plan.id}
              className={cn(
                "bg-card flex flex-col gap-6 rounded-2xl p-8",
                plus ? "ring-primary ring-2" : "ring-foreground/10 ring-1",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-2xl font-bold">{plan.name}</h3>
                {plus && <Badge>Most refined</Badge>}
              </div>
              <div>
                <p className="font-heading text-4xl font-extrabold">
                  {formatUsd(plan.monthlyUsd)}
                  <span className="text-muted-foreground text-base font-normal">
                    /month
                  </span>
                </p>
                <p className="text-muted-foreground">
                  {plan.annualUsd > 0
                    ? `or ${formatUsd(plan.annualUsd)}/year`
                    : "Included with every device"}
                </p>
              </div>
              <dl className="divide-border divide-y">
                <Row
                  label="Memory kept"
                  value={formatMemory(plan.memoryDays)}
                />
                <Row
                  label="Notes recording"
                  value={formatNotesHours(plan.notesHoursPerMonth)}
                />
                <Row
                  label="Refined answers"
                  value={
                    plan.refinedAnswers ? (
                      <CheckIcon
                        aria-label="Included"
                        className="text-primary size-5"
                      />
                    ) : (
                      <MinusIcon
                        aria-label="Not included"
                        className="text-muted-foreground size-5"
                      />
                    )
                  }
                />
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
