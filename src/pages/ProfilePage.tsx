import { useAuthStore } from '@/stores/authStore'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-4 px-4 py-3 border-b border-pm-border last:border-0">
      <span className="text-[10px] font-bold text-pm-muted uppercase tracking-widest whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-pm-primary truncate">{value}</span>
    </div>
  )
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-pm-primary tracking-tight">Profile</h1>
        <p className="text-sm text-pm-muted mt-0.5">Your account identity</p>
      </div>

      <div className="bg-pm-surface rounded-2xl border border-pm-border overflow-hidden">
        <div className="flex flex-col items-center gap-3 py-7 border-b border-pm-border">
          <div className="w-20 h-20 rounded-2xl bg-pm-teal flex items-center justify-center text-white text-2xl font-bold select-none">
            {initials}
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-pm-primary">{user?.name ?? '—'}</p>
            <p className="text-sm text-pm-muted mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-0 rounded-xl border border-pm-border overflow-hidden">
            <InfoRow label="Name" value={user?.name ?? '—'} />
            <InfoRow label="Email" value={user?.email ?? '—'} />
            <InfoRow label="Role" value={user?.role === 'admin' ? 'Administrator' : 'User'} />
            <InfoRow
              label="Status"
              value={user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
