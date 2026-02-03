'use client'

import { Card } from "@/components/ui/card"

import React from "react"

import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, DollarSign, Briefcase, Users, ChevronDown, TrendingDown } from 'lucide-react'

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
}

function StatCard({ title, value, icon, bgColor, textColor, completedRate, showProgress }: StatCardProps) {
  const [timeRange, setTimeRange] = useState('7days')

  return (
    <div className={`${bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0">{icon}</div>
        </div>
        <div className="relative">
          <button className="flex items-center gap-1 text-white text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0">
            Last 7 days
            <ChevronDown size={14} className="sm:w-4 sm:h-4" />
          </button>
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
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Welcome to your admin panel. Here's an overview of your tours and bookings.</p>
      </div>

      {/* Stats Cards - Fully Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="BOOKINGS"
          value="0"
          icon={<Calendar className="text-white" size={28} />}
          bgColor="bg-orange-500"
          textColor="text-orange-500"
          completedRate={45}
          showProgress={true}
        />

        <StatCard
          title="TOTAL INCOME"
          value="$0"
          icon={<DollarSign className="text-white" size={28} />}
          bgColor="bg-green-500"
          textColor="text-green-500"
        />

        <StatCard
          title="CLIENT REQUESTS"
          value="0"
          icon={<Briefcase className="text-white" size={28} />}
          bgColor="bg-blue-500"
          textColor="text-blue-500"
        />

        <StatCard
          title="TOTAL CLIENTS"
          value="0"
          icon={<Users className="text-white" size={28} />}
          bgColor="bg-purple-500"
          textColor="text-purple-500"
        />
      </div>

      {/* Charts - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Tours Created</h2>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="tours" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Bookings Trend</h2>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
