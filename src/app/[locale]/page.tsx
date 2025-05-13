export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

type PageProps = {
  params: { locale: string };
};

// Redirect to the locale-specific home page
export default async function LocaleRootPage(props: PageProps) {
  // Properly await params before accessing
  const { locale: rawLocale } = await Promise.resolve(props.params);
  
  // Normalize locale to ensure it's just the base code
  const locale = rawLocale.split('-')[0];
  
  // Redirect to the home page
  redirect(`/${locale}/home`);
}