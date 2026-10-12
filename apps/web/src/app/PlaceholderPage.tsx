import { Link } from "react-router";

// Stand-in for screens that are built in later steps.
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted">This screen is coming soon.</p>
      <Link to="/" className="font-semibold text-primary underline">
        Back to search
      </Link>
    </div>
  );
}
