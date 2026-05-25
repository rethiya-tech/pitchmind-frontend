import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import api from '@/services/api'
import type { AdminUser, AdminUserListResponse, AdminUserCreateResponse, AccountStatus } from '@/types'

const PAGE_SIZE = 20

const STATUS_FILTERS: { label: string; value: '' | AccountStatus }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
]

const STATUS_BADGE: Record<AccountStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-pm-danger/10 text-pm-danger',
  rejected: 'bg-pm-surface-3 text-pm-muted',
}

interface UserFormData {
  name: string
  email: string
  role: 'user' | 'admin'
}

const EMPTY_FORM: UserFormData = { name: '', email: '', role: 'user' }

function extractError(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string') return detail
  return (detail as { message?: string })?.message ?? fallback
}

/** Create modal — collects name/email/role, then reveals the one-time
 * generated password so the admin can relay it out-of-band. */
function CreateUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  const set = (field: keyof UserFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) return toast.error('Email is required.')
    setSaving(true)
    try {
      const res = await api.post<AdminUserCreateResponse>('/admin/users', {
        email: form.email.trim(),
        name: form.name.trim() || null,
        role: form.role,
      })
      setCreated({ email: res.data.user.email, password: res.data.temporary_password })
    } catch (err: unknown) {
      toast.error(extractError(err, 'Failed to create user.'))
    } finally {
      setSaving(false)
    }
  }

  const copy = () => {
    if (created) {
      void navigator.clipboard?.writeText(created.password)
      toast.success('Password copied.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-pm-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-pm-primary">Create User</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-pm-muted hover:bg-pm-surface-3 transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {created ? (
          <div className="space-y-4">
            <p className="text-sm text-pm-muted">
              User <span className="font-semibold text-pm-primary">{created.email}</span> was created.
              Share this one-time password with them now — <span className="font-semibold">it won't be shown again</span>.
              They'll be required to change it on first login.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-pm-surface-3 text-pm-primary text-sm font-mono break-all">
                {created.password}
              </code>
              <Button type="button" variant="secondary" size="sm" onClick={copy}>Copy</Button>
            </div>
            <button
              type="button"
              onClick={() => { onSaved() }}
              className="w-full py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-pm-muted mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Full name (optional)"
                className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-pm-muted mb-1">Email <span className="text-pm-danger">*</span></label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-pm-muted mb-1">Role <span className="text-pm-danger">*</span></label>
              <select
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal bg-pm-surface"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <p className="text-xs text-pm-muted">
              A one-time password is generated automatically and shown after creation.
            </p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-pm-border text-sm font-semibold text-pm-muted hover:bg-pm-surface-2 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)' }}
              >
                {saving && <Spinner size="sm" className="text-white" />}
                Create User
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/** Edit modal — name / email / role only. Lifecycle (approve/suspend/…) is
 * handled via dedicated row actions. */
function EditUserModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<UserFormData>({
    name: user.name ?? '',
    email: user.email,
    role: user.role as 'user' | 'admin',
  })
  const [saving, setSaving] = useState(false)

  const set = (field: keyof UserFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) return toast.error('Email is required.')
    setSaving(true)
    try {
      await api.patch(`/admin/users/${user.id}`, {
        email: form.email.trim(),
        name: form.name.trim() || null,
        role: form.role,
      })
      toast.success('User updated.')
      onSaved()
    } catch (err: unknown) {
      toast.error(extractError(err, 'Failed to update user.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-pm-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-pm-primary">Edit User</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-pm-muted hover:bg-pm-surface-3 transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-pm-muted mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Full name (optional)"
              className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-pm-muted mb-1">Email <span className="text-pm-danger">*</span></label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-pm-muted mb-1">Role <span className="text-pm-danger">*</span></label>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal bg-pm-surface"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-pm-border text-sm font-semibold text-pm-muted hover:bg-pm-surface-2 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)' }}
            >
              {saving && <Spinner size="sm" className="text-white" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | AccountStatus>('')
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; user: AdminUser } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<AdminUserListResponse>({
    queryKey: ['admin-users', page, search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/admin/users', {
        params: { page, page_size: PAGE_SIZE, search, status: statusFilter },
      })
      return res.data
    },
  })
  const showSpinner = useDelayedLoading(isLoading)

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleSaved = useCallback(() => {
    setModal(null)
    void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }, [queryClient])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [resetCreds, setResetCreds] = useState<{ email: string; password: string } | null>(null)

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const lifecycleAction = useCallback(
    async (user: AdminUser, action: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
      setBusyId(user.id)
      try {
        await api.post(`/admin/users/${user.id}/${action}`)
        toast.success(`User ${action}d.`)
        void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      } catch (err: unknown) {
        toast.error(extractError(err, `Failed to ${action} user.`))
      } finally {
        setBusyId(null)
      }
    },
    [queryClient]
  )

  const resetPassword = useCallback(
    async (user: AdminUser) => {
      setBusyId(user.id)
      try {
        const res = await api.post(`/admin/users/${user.id}/reset-password`)
        setResetCreds({ email: user.email, password: res.data.temporary_password })
        void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      } catch (err: unknown) {
        toast.error(extractError(err, 'Failed to reset password.'))
      } finally {
        setBusyId(null)
      }
    },
    [queryClient]
  )

  const bulkAction = async (action: 'approve' | 'suspend') => {
    const allIds = [...selected]
    if (!allIds.length) return

    // Only act on users whose current status makes the action meaningful
    const eligibleStatus = action === 'approve'
      ? ['pending', 'suspended', 'rejected']
      : ['active']
    const eligible = (data?.items ?? []).filter(
      (u) => allIds.includes(u.id) && eligibleStatus.includes(u.status)
    )

    if (!eligible.length) {
      toast.error(
        action === 'approve'
          ? 'No pending/suspended users selected to approve.'
          : 'No active users selected to suspend.'
      )
      return
    }

    setBulkBusy(true)
    let ok = 0
    for (const u of eligible) {
      try {
        await api.post(`/admin/users/${u.id}/${action}`)
        ok++
      } catch { /* keep going */ }
    }
    setBulkBusy(false)
    setSelected(new Set())
    toast.success(`${ok}/${eligible.length} user(s) ${action === 'approve' ? 'approved' : 'suspended'}.`)
    void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  return (
    <div className="space-y-6">
      {modal?.mode === 'create' && (
        <CreateUserModal onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.mode === 'edit' && (
        <EditUserModal user={modal.user} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {resetCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-pm-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <h2 className="text-lg font-bold text-pm-primary">Password reset</h2>
            <p className="text-sm text-pm-muted">
              New one-time password for <span className="font-semibold text-pm-primary">{resetCreds.email}</span>.
              Share it now — <span className="font-semibold">it won't be shown again</span>. The user must
              change it on next login.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-pm-surface-3 text-pm-primary text-sm font-mono break-all">
                {resetCreds.password}
              </code>
              <Button type="button" variant="secondary" size="sm"
                onClick={() => { void navigator.clipboard?.writeText(resetCreds.password); toast.success('Copied.') }}>
                Copy
              </Button>
            </div>
            <button
              onClick={() => setResetCreds(null)}
              className="w-full py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-heading">Users</h1>
          <p className="text-sm text-pm-muted mt-0.5">Review registrations and manage accounts</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)', boxShadow: '0 4px 14px rgba(15,110,86,0.25)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border border-pm-border/50" style={{ background: 'var(--pm-glass-bg-soft)', backdropFilter: 'blur(8px)', width: 'fit-content' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => { setStatusFilter(f.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              statusFilter === f.value
                ? 'bg-pm-surface text-pm-teal shadow-sm border border-pm-teal/20'
                : 'text-pm-muted hover:text-pm-primary hover:bg-pm-surface/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 px-3 py-2 rounded-xl border border-pm-border/60 text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
          style={{ background: 'var(--pm-glass-bg-soft)', backdropFilter: 'blur(8px)' }}
        />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
        {search && (
          <Button type="button" variant="secondary" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}>
            Clear
          </Button>
        )}
      </form>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-pm-teal-light border border-pm-teal/30">
          <span className="text-sm font-semibold text-pm-teal">{selected.size} selected</span>
          <Button size="sm" variant="primary" disabled={bulkBusy} onClick={() => bulkAction('approve')} title="Approves pending users; reactivates suspended/rejected ones">Approve / Reactivate</Button>
          <Button size="sm" variant="secondary" disabled={bulkBusy} onClick={() => bulkAction('suspend')} title="Only applies to active users">Suspend active</Button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-pm-muted hover:text-pm-primary ml-auto">Clear</button>
        </div>
      )}

      {isLoading ? (
        <PageLoader show={showSpinner} />
      ) : (
        <div className="rounded-2xl border border-pm-border/60 overflow-hidden shadow-card" style={{ background: 'var(--pm-glass-bg)', backdropFilter: 'blur(12px)' }}>
          <table className="w-full text-sm">
            <thead className="bg-pm-surface/60">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Name / Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Presentations</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pm-border">
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-pm-muted">No users found.</td>
                </tr>
              )}
              {data?.items.map((u) => {
                const busy = busyId === u.id
                return (
                  <tr key={u.id} className="transition-all duration-150 divide-y divide-pm-border/60 hover:shadow-[inset_3px_0_0_#0F6E56]"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(238,248,242,0.55)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleSel(u.id)}
                        className="w-4 h-4 accent-pm-teal cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-pm-primary">{u.name ?? '—'}</div>
                      <div className="text-xs text-pm-muted">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-pm-teal-light text-pm-teal' : 'bg-pm-surface-3 text-pm-muted'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[u.status]}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-pm-muted">{u.conversion_count}</td>
                    <td className="px-5 py-3.5 text-pm-muted whitespace-nowrap">
                      {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(u.created_at))}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {u.status === 'pending' && (
                          <>
                            <Button size="sm" variant="primary" disabled={busy} onClick={() => lifecycleAction(u, 'approve')}>Approve</Button>
                            <Button size="sm" variant="secondary" disabled={busy} onClick={() => lifecycleAction(u, 'reject')}>Reject</Button>
                          </>
                        )}
                        {u.status === 'active' && (
                          <Button size="sm" variant="secondary" disabled={busy} onClick={() => lifecycleAction(u, 'suspend')}>Suspend</Button>
                        )}
                        {(u.status === 'suspended' || u.status === 'rejected') && (
                          <Button size="sm" variant="primary" disabled={busy} onClick={() => lifecycleAction(u, 'reactivate')}>Reactivate</Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => resetPassword(u)}
                          title="Generate a one-time password the user must change on next login"
                        >
                          Reset PW
                        </Button>
                        <button
                          onClick={() => setModal({ mode: 'edit', user: u })}
                          title="Edit user"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-pm-surface hover:bg-pm-surface-2 text-pm-muted hover:text-pm-primary transition-colors"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-5 py-3 border-t border-pm-border/60 flex items-center justify-between bg-pm-surface/60">
            <p className="text-xs text-pm-muted">
              Showing <span className="font-semibold text-pm-primary">{data?.items.length ?? 0}</span> of{' '}
              <span className="font-semibold text-pm-primary">{data?.total ?? 0}</span> users
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
