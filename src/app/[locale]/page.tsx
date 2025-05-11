export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

// Redirect to the locale-specific home page
export default async function LocaleRootPage({ params }: { params: { locale: string } }) {
  // Normalize locale to ensure it's just the base code
  const locale = params.locale.split('-')[0];
  
  // Redirect to the home page
  redirect(`/${locale}/home`);
}