import { redirect } from 'next/navigation';

type SearchParams = { q?: string; type?: string };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = new URLSearchParams();
  if (searchParams.q) params.set('q', searchParams.q);
  if (searchParams.type) params.set('type', searchParams.type);
  const qs = params.toString();
  redirect(qs ? `/?${qs}` : '/');
}
