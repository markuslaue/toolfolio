import { cn } from "@/lib/utils";

/** Toolfolio Stapel-Icon: drei versetzte gerundete Quadrate. */
export function ToolfolioIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      className={cn("h-7 w-7", className)}
      role="img"
      aria-label="Toolfolio"
    >
      <g transform="translate(4,4)">
        <rect x="30" y="4" width="30" height="30" rx="8" fill="#12B76A" stroke="#FBF7F1" strokeWidth="3" />
        <rect x="19" y="15" width="30" height="30" rx="8" fill="#FF7A66" stroke="#FBF7F1" strokeWidth="3" />
        <rect x="8" y="26" width="30" height="30" rx="8" fill="#6C5CE7" stroke="#FBF7F1" strokeWidth="3" />
      </g>
    </svg>
  );
}

/** Wortmarke plus Icon. */
export function ToolfolioLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ToolfolioIcon />
      <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
        Toolfolio
      </span>
    </span>
  );
}
