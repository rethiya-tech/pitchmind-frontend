import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import type { AdminUserListResponse } from '@/types'

const PAGE_SIZE = 20

interface UserFormData {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  is_active: boolean
}

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  is_active: boolean
  created_at: string
  conversion_count: number
}

const EMPTY_FORM: UserFormData = { name: '', email: '', password: '', role: 'user', is_active: true }

function UserFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  initial: AdminUser | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<UserFormData>(
    initial
      ? { name: initial.name ?? '', email: initial.email, password: '', role: initial.role as 'user' | 'admin', is_active: initial.is_active }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)

  const set = (field: keyof UserFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) return toast.error('Email is required.')
    if (mode === 'create' && !form.password.trim()) return toast.error('Password is required.')
    setSaving(true)
    try {
      if (mode === 'create') {
        await api.post('/admin/users', {
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim() || null,
          role: form.role,
        })
        toast.success('User created.')
      } else {
        const payload: Record<string, unknown> = {
          email: form.email.trim(),
          name: form.name.trim() || null,
          role: form.role,
          is_active: form.is_active,
        }
        if (form.password.trim()) payload.password = form.password
        await api.patch(`/admin/users/${initial!.id}`, payload)
        toast.success('User updated.')
      }
      onSaved()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: { message?: string } } } })?.response?.data?.detail?.message
      toast.error(msg ?? (mode === 'create' ? 'Failed to create user.' : 'Failed to update user.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-pm-primary">
            {mode === 'create' ? 'Create User' : 'Edit User'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-pm-muted hover:bg-gray-100 transition-colors">
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
              placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-pm-muted mb-1">
              Password {mode === 'edit' && <span className="font-normal text-pm-muted">(leave blank to keep current)</span>}
              {mode === 'create' && <span className="text-pm-danger"> *</span>}
            </label>
            <input
              type="password"
              required={mode === 'create'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={mode === 'edit' ? 'New password…' : 'Password'}
              className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-pm-muted mb-1">Role <span className="text-pm-danger">*</span></label>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal bg-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-xs font-semibold text-pm-muted mb-1">Status</label>
              <select
                value={form.is_active ? 'active' : 'suspended'}
                onChange={(e) => set('is_active', e.target.value === 'active')}
                className="w-full px-3 py-2 rounded-lg border border-pm-border text-sm text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal bg-white"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-pm-border text-sm font-semibold text-pm-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Spinner size="sm" className="text-white" />}
              {mode === 'create' ? 'Create User' : 'Save Changes'}
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
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; user: AdminUser | null } | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<AdminUserListResponse>({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { page, page_size: PAGE_SIZE, search } })
      return res.data
    },
  })

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

  return (
    <div className="space-y-6">
      {modal && (
        <UserFormModal
          mode={modal.mode}
          initial={modal.user}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-pm-primary tracking-tight">Users</h1>
          <p className="text-sm text-pm-muted mt-0.5">Manage all user accounts</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', user: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 px-3 py-2 rounded-xl border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal bg-white"
        />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
        {search && (
          <Button type="button" variant="secondary" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}>
            Clear
          </Button>
        )}
      </form>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-pm-teal" />
        </div>
      ) : (
        <div className="bg-pm-surface rounded-2xl border border-pm-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
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
                  <td colSpan={6} className="px-4 py-10 text-center text-pm-muted">No users found.</td>
                </tr>
              )}
              {data?.items.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-pm-primary">{u.name ?? '—'}</div>
                    <div className="text-xs text-pm-muted">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-[#E1F5EE] text-pm-teal' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-pm-muted">{u.conversion_count}</td>
                  <td className="px-5 py-3.5 text-pm-muted whitespace-nowrap">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(u.created_at))}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setModal({ mode: 'edit', user: u as AdminUser })}
                      title="Edit user"
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-white hover:bg-gray-50 text-pm-muted hover:text-pm-primary transition-colors"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 border-t border-pm-border bg-[#F9FAFB] flex items-center justify-between">
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
