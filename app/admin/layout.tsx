import AdminShell from './AdminShell'

// Admin pages are per-user and auth-gated; render on every request so the
// response is sent with `Cache-Control: no-store` and never cached by the host's CDN.
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
