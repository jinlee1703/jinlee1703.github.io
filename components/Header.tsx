import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          개발자 이진우
        </Link>
        <nav className="flex items-center gap-1 text-sm text-[var(--muted)]">
          <Link
            href="/posts/"
            className="rounded-md px-2 py-1 transition-colors hover:text-[var(--foreground)]"
          >
            글
          </Link>
          <Link
            href="/bookshelf/"
            className="rounded-md px-2 py-1 transition-colors hover:text-[var(--foreground)]"
          >
            책
          </Link>
          <Link
            href="/about/"
            className="rounded-md px-2 py-1 transition-colors hover:text-[var(--foreground)]"
          >
            소개
          </Link>
          <a
            href="https://github.com/jinlee1703"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:text-[var(--foreground)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
            </svg>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
