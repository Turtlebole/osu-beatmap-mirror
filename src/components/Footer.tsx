import Link from 'next/link';
import { t } from '@/lib/i18n';

type FooterProps = {
  locale: string;
};

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-bold mb-4">osu!mirror</h2>
            <p className="text-muted-foreground text-sm">
              A beatmap mirror for the rhythm game osu! This site helps players discover and download beatmaps.
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-bold mb-4">Links</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/home`} className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/popular`} className="text-foreground hover:text-primary transition-colors">
                  Popular
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/recent`} className="text-foreground hover:text-primary transition-colors">
                  Recent
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/collections`} className="text-foreground hover:text-primary transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-bold mb-4">Legal</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/terms`} className="text-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} osu!mirror. All rights reserved.</p>
          <p className="mt-1">
            osu!mirror is not affiliated with osu! or ppy Pty Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
} 