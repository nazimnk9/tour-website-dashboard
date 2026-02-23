'use client'

import { Card } from "@/components/ui/card"

import React from "react"

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, DollarSign, Briefcase, Users, ChevronDown, TrendingDown } from 'lucide-react'
import { getDashboardStats, DashboardStats } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/auth-context'

const chartData = [
  { month: 'Jan', tours: 4, bookings: 2 },
  { month: 'Feb', tours: 3, bookings: 2 },
  { month: 'Mar', tours: 8, bookings: 5 },
  { month: 'Apr', tours: 6, bookings: 4 },
  { month: 'May', tours: 9, bookings: 7 },
  { month: 'Jun', tours: 12, bookings: 9 },
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  bgColor: string
  textColor: string
  completedRate?: number
  showProgress?: boolean
  loading?: boolean
}

function StatCard({ title, value, icon, bgColor, textColor, completedRate, showProgress, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className={`${bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg animate-pulse`}>
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg w-12 h-12"></div>
        </div>
        <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
        <div className="h-8 bg-white/20 rounded w-16 mb-4"></div>
        {showProgress && <div className="h-2 bg-white/20 rounded-full w-full"></div>}
      </div>
    )
  }

  return (
    <div className={`${bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0">{icon}</div>
        </div>
      </div>

      <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 opacity-90">{title}</h3>
      <p className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">{value}</p>

      {showProgress && completedRate !== undefined && (
        <div className="mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm opacity-90 mb-2">Completed rate</p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-teal-400 h-2 rounded-full transition-all"
              style={{ width: `${completedRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return
      try {
        setLoading(true)
        const data = await getDashboardStats(token)
        setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token])

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Welcome to your admin panel. Here's an overview of your tours and bookings.</p>
      </div>

      {/* Stats Cards - Fully Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="BOOKINGS"
          value={stats?.total_bookings || 0}
          icon={<Calendar className="text-white" size={28} />}
          bgColor="bg-orange-500"
          textColor="text-orange-500"
          completedRate={parseFloat(stats?.completion_rate || '0')}
          showProgress={true}
          loading={loading}
        />

        <StatCard
          title="TOTAL INCOME"
          value={`€${(stats?.total_income || 0).toLocaleString()}`}
          icon={<DollarSign className="text-white" size={28} />}
          bgColor="bg-green-500"
          textColor="text-green-500"
          loading={loading}
        />

        <StatCard
          title="CLIENT REQUESTS"
          value={stats?.total_client_request || 0}
          icon={<Briefcase className="text-white" size={28} />}
          bgColor="bg-blue-500"
          textColor="text-blue-500"
          loading={loading}
        />
      </div>

      {/* Charts - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Charts area remained commented out or empty as in source */}
      </div>
    </div>
  )
}
