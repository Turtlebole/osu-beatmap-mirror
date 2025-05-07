import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ja', name: '日本語' }
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.push(`/${newLocale}${pathname}`);
  };

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={locale === lang.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLanguageChange(lang.code)}
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
} 