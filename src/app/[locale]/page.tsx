export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

type PageProps = {
  params: { locale: string };
};

export default async function LocaleRootPage(props: PageProps) {
  const { locale: rawLocale } = await Promise.resolve(props.params);
  
  const locale = rawLocale.split('-')[0];
  
  redirect(`/${locale}/home`);
}