'use client'

import { CreditCard, Download, Check, AlertCircle } from 'lucide-react'

const PLANS = [
  { name: 'Starter', price: 'Free', features: ['5 team members', '10GB storage', 'Basic AI features'] },
  { name: 'Professional', price: '$12/mo', features: ['Unlimited members', '100GB storage', 'Advanced AI', 'Priority support'], current: true },
  { name: 'Enterprise', price: 'Custom', features: ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] },
]

const INVOICES = [
  { id: '1', date: 'Dec 1, 2024', amount: '$48.00', status: 'Paid' },
  { id: '2', date: 'Nov 1, 2024', amount: '$48.00', status: 'Paid' },
  { id: '3', date: 'Oct 1, 2024', amount: '$48.00', status: 'Paid' },
]

export default function BillingSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Billing</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your subscription and payment methods</p>

        {/* Current Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Professional</p>
              <p className="text-gray-600 dark:text-gray-400">$12/user/month • 4 users = $48/month</p>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map(plan => (
            <div key={plan.name} className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${plan.current ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700'}`}>
              {plan.current && <span className="text-xs text-purple-600 font-medium">CURRENT PLAN</span>}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-500">Expires 12/25</p>
            </div>
            <button className="ml-auto text-sm text-purple-600 hover:underline">Update</button>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Billing History</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {INVOICES.map(invoice => (
              <div key={invoice.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.date}</p>
                  <p className="text-sm text-gray-500">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-600">{invoice.status}</span>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
