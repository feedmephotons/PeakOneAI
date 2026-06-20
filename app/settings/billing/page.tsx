'use client'

import { useState } from 'react'
import { CreditCard, Download, Check, X } from 'lucide-react'
import { MOCK_ORG_IDENTITY } from '@/lib/peak/mock'

const ORG = MOCK_ORG_IDENTITY

const PLANS = [
  { name: 'Starter', price: 'Free', features: ['5 team members', '10GB storage', 'Basic AI features'] },
  { name: 'Business', price: '$49/mo', features: ['Unlimited members', '100GB storage', 'Advanced AI', 'Priority support'], current: ORG.plan === 'Business' },
  { name: 'Enterprise', price: 'Custom', features: ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] },
]

// Per-seat math derived from the canonical seat count.
const PER_SEAT = 49
const MONTHLY_TOTAL = `$${(PER_SEAT * ORG.seatsUsed).toFixed(2)}`

function formatInvoiceDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BillingSettingsPage() {
  const [modal, setModal] = useState<null | { title: string; body: string }>(null)

  // EXTERNAL: needs Stripe Checkout / billing portal / invoice PDF URLs. Demo path opens an info modal.
  const openModal = (title: string, body: string) => setModal({ title, body })

  const downloadInvoice = (id: string, date: string, amount: string) => {
    // Generate a simple text receipt client-side so the Download button does real work in the demo.
    const receipt = [
      `Acme Corp — Invoice ${id}`,
      `Account holder: ${ORG.user.name} (${ORG.billingEmail})`,
      `Plan: ${ORG.plan} • ${ORG.seatsUsed} seats`,
      `Date: ${formatInvoiceDate(date)}`,
      `Amount: ${amount}`,
      `Status: Paid`,
    ].join('\n')
    const uri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(receipt)
    const a = document.createElement('a')
    a.setAttribute('href', uri)
    a.setAttribute('download', `acme_invoice_${id}.txt`)
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Billing</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your subscription and payment methods</p>

        {/* Account Holder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Holder</h2>
          <p className="text-gray-900 dark:text-white font-medium">{ORG.user.name}</p>
          <p className="text-sm text-gray-500">{ORG.billingEmail} • {ORG.company}</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ORG.plan}</p>
              <p className="text-gray-600 dark:text-gray-400">
                ${PER_SEAT}/user/month • {ORG.seatsUsed} users = {MONTHLY_TOTAL}/month
              </p>
              <p className="text-sm text-gray-500 mt-1">Next invoice {formatInvoiceDate(ORG.nextInvoiceDate)}</p>
            </div>
            <button
              onClick={() => openModal('Upgrade Plan', 'In production this opens Stripe Checkout to change your subscription. Acme Corp is on the Business plan.')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.name}
              onClick={() => !plan.current && openModal(`Switch to ${plan.name}`, `In production this starts a Stripe Checkout session for the ${plan.name} plan.`)}
              className={`text-left bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition ${plan.current ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
            >
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
            </button>
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
              <p className="font-medium text-gray-900 dark:text-white">{ORG.cardBrand} •••• •••• •••• {ORG.cardLast4}</p>
              <p className="text-sm text-gray-500">Expires {ORG.cardExpiry}</p>
            </div>
            <button
              onClick={() => openModal('Update Payment Method', 'In production this opens the Stripe billing portal to update the card on file.')}
              className="ml-auto text-sm text-purple-600 hover:underline"
            >
              Update
            </button>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Billing History</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ORG.invoices.map(invoice => (
              <div key={invoice.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{formatInvoiceDate(invoice.date)}</p>
                  <p className="text-sm text-gray-500">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-600">{invoice.status === 'PAID' ? 'Paid' : invoice.status === 'DUE' ? 'Due' : 'Failed'}</span>
                  <button
                    onClick={() => downloadInvoice(invoice.id, invoice.date, invoice.amount)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    aria-label={`Download invoice ${invoice.id}`}
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mock action modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{modal.title}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{modal.body}</p>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
