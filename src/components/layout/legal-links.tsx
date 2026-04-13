import Link from "next/link";

interface LegalLinksProps {
  className?: string;
}

export function LegalLinks({ className }: LegalLinksProps) {
  return (
    <div className={className}>
      <Link href="/terms" className="underline decoration-rose-300/60 underline-offset-4">
        Terms
      </Link>
      <span className="text-rose-900/40">•</span>
      <Link href="/privacy" className="underline decoration-rose-300/60 underline-offset-4">
        Privacy
      </Link>
      <span className="text-rose-900/40">•</span>
      <a
        href="mailto:contact@zenfulnote.app"
        className="underline decoration-rose-300/60 underline-offset-4"
      >
        Contact
      </a>
    </div>
  );
}
