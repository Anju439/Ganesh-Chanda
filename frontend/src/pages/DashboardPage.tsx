import { HandHeart, IndianRupee, Users, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../api'
import { useAuth } from '../auth'
import { formatDate, formatRupees } from '../format'
import type { Dashboard } from '../types'

const CHART_COLORS = ['#6b1d12', '#e07a2f', '#e8a317', '#8d4a2b', '#3f6b4a']

export default function DashboardPage() {
  const { staff } = useAuth()
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-[#7a5a4a]">Loading the mandal ledger…</p>
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        {error ?? 'Could not load the dashboard.'}
      </div>
    )
  }

  const stats = [
    { label: 'Total raised', value: formatRupees(data.totalRaised), icon: IndianRupee },
    { label: 'This month', value: formatRupees(data.thisMonthTotal), icon: Wallet },
    { label: 'Registered donors', value: String(data.donorCount), icon: Users },
    { label: 'Gifts recorded', value: String(data.donationCount), icon: HandHeart },
  ]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-[#6b1d12] p-6 text-[#fff8ea] shadow-lg md:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[#e8a317]">Shri Ganeshaya Namah</p>
        <h1 className="font-display mt-2 max-w-2xl text-3xl md:text-4xl">
          Ganesh Chanda collection desk
        </h1>
        <p className="mt-3 max-w-2xl text-[#f3d9b0]">
          Register donors, record chanda, and watch the festival fund grow. Seed data is loaded so
          you can explore the ledger immediately.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/donors/new"
            className="rounded-full bg-[#e8a317] px-4 py-2 text-sm font-semibold text-[#4a1a10] no-underline"
          >
            Register a donor
          </Link>
          <Link
            to="/donations/new"
            className="rounded-full border border-[#e8a317]/50 px-4 py-2 text-sm font-semibold text-[#fff8ea] no-underline"
          >
            Record a donation
          </Link>
          {staff?.isMainAdmin && (
            <Link
              to="/inbox"
              className="rounded-full bg-[#fff8ea] px-4 py-2 text-sm font-semibold text-[#6b1d12] no-underline"
            >
              Open Admin inbox
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#7a5a4a]">{stat.label}</p>
              <stat.icon className="text-[#e07a2f]" size={18} />
            </div>
            <p className="font-display mt-2 text-2xl text-[#6b1d12]">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-4 shadow-sm">
          <h2 className="font-display text-xl text-[#6b1d12]">Monthly collections</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid stroke="#edd8b8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatRupees(Number(value))} />
                <Bar dataKey="total" fill="#6b1d12" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-4 shadow-sm">
          <h2 className="font-display text-xl text-[#6b1d12]">By purpose</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byPurpose} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="#edd8b8" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatRupees(Number(value))} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {data.byPurpose.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-[#6b1d12]">Recent gifts</h2>
            <Link to="/donations" className="text-sm font-semibold text-[#e07a2f] no-underline">
              View all
            </Link>
          </div>
          {data.recentDonations.length === 0 ? (
            <p className="mt-4 text-[#7a5a4a]">No donations recorded yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#f0e2cb]">
              {data.recentDonations.map((gift) => (
                <li key={gift.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{gift.donorName}</p>
                    <p className="text-sm text-[#7a5a4a]">
                      {gift.purpose} · {formatDate(gift.donationDate)}
                    </p>
                  </div>
                  <p className="font-semibold text-[#6b1d12]">{formatRupees(gift.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-4 shadow-sm">
          <h2 className="font-display text-xl text-[#6b1d12]">Top donors</h2>
          {data.topDonors.length === 0 ? (
            <p className="mt-4 text-[#7a5a4a]">Register donors to see rankings.</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {data.topDonors.map((donor, index) => (
                <li key={donor.donorId} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f6e6c8] text-sm font-bold text-[#6b1d12]">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{donor.fullName}</p>
                    <p className="text-sm text-[#7a5a4a]">{donor.giftCount} gifts</p>
                  </div>
                  <p className="font-semibold">{formatRupees(donor.totalDonated)}</p>
                </li>
              ))}
            </ol>
          )}
        </article>
      </section>
    </div>
  )
}
