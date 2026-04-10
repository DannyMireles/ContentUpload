interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">{eyebrow}</div>
        <h2 className="mt-3 break-words text-3xl text-rose-950">{title}</h2>
        <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-rose-900/65">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
