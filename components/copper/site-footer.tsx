import { Logo } from "@/components/copper/logo";

// Always Night Sky: the `dark` class gives the footer the dark theme (and the
// light wordmark) in both light and dark mode.
export function SiteFooter() {
  return (
    <div className="dark">
      <footer
        data-testid="site-footer"
        className="bg-background text-foreground"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
          <Logo className="w-40" />
          <p className="text-muted-foreground text-sm">
            Fictional — for educational use.
          </p>
        </div>
      </footer>
    </div>
  );
}
