'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreditCard, Download, Check, X, ArrowLeft } from 'lucide-react'
import { GlassPanel, SectionLabel } from '@/components/peak'
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
  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
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
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-peak-muted hover:text-peak transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak mb-2">Billing</h1>
        <p className="text-peak-muted mb-8">Manage your subscription and payment methods</p>

        {/* Account Holder */}
        <GlassPanel className="mb-8">
          <SectionLabel className="mb-3">Account Holder</SectionLabel>
          <p className="text-peak font-medium">{ORG.user.name}</p>
          <p className="text-sm text-peak-muted">{ORG.billingEmail} • {ORG.company}</p>
        </GlassPanel>

        {/* Current Plan */}
        <GlassPanel className="mb-8">
          <SectionLabel className="mb-4">Current Plan</SectionLabel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-peak">{ORG.plan}</p>
              <p className="text-peak-muted">
                ${PER_SEAT}/user/month • {ORG.seatsUsed} users = {MONTHLY_TOTAL}/month
              </p>
              <p className="text-sm text-peak-dim mt-1">Next invoice {formatInvoiceDate(ORG.nextInvoiceDate)}</p>
            </div>
            <button
              onClick={() => openModal('Upgrade Plan', 'In production this opens Stripe Checkout to change your subscription. Acme Corp is on the Business plan.')}
              className="px-4 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </GlassPanel>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.name}
              onClick={() => !plan.current && openModal(`Switch to ${plan.name}`, `In production this starts a Stripe Checkout session for the ${plan.name} plan.`)}
              className={`text-left bg-peak-glass rounded-2xl border-2 p-6 transition-colors ${plan.current ? 'border-peak-primary' : 'border-peak-border hover:border-peak-primary/50'}`}
            >
              {plan.current && <span className="text-xs text-peak-primary-300 font-medium">CURRENT PLAN</span>}
              <h3 className="text-xl font-semibold tracking-tight text-peak mt-2">{plan.name}</h3>
              <p className="text-2xl font-semibold tracking-tight text-peak mt-2">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-peak-muted">
                    <Check className="w-4 h-4 text-peak-green" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Payment Method */}
        <GlassPanel className="mb-8">
          <SectionLabel className="mb-4">Payment Method</SectionLabel>
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-peak-primary rounded flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-peak">{ORG.cardBrand} •••• •••• •••• {ORG.cardLast4}</p>
              <p className="text-sm text-peak-dim">Expires {ORG.cardExpiry}</p>
            </div>
            <button
              onClick={() => openModal('Update Payment Method', 'In production this opens the Stripe billing portal to update the card on file.')}
              className="ml-auto text-sm text-peak-primary-300 hover:text-peak-primary transition-colors"
            >
              Update
            </button>
          </div>
        </GlassPanel>

        {/* Invoices */}
        <div className="bg-peak-glass border border-peak-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-peak-border">
            <h2 className="font-semibold text-peak">Billing History</h2>
          </div>
          <div className="divide-y divide-peak-border">
            {ORG.invoices.map(invoice => (
              <div key={invoice.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-peak">{formatInvoiceDate(invoice.date)}</p>
                  <p className="text-sm text-peak-muted">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-peak-green">{invoice.status === 'PAID' ? 'Paid' : invoice.status === 'DUE' ? 'Due' : 'Failed'}</span>
                  <button
                    onClick={() => downloadInvoice(invoice.id, invoice.date, invoice.amount)}
                    className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors"
                    aria-label={`Download invoice ${invoice.id}`}
                  >
                    <Download className="w-4 h-4 text-peak-dim" />
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
          <div className="bg-peak-glass border border-peak-border rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-peak-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-peak">{modal.title}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/[0.04] rounded transition-colors">
                <X className="w-5 h-5 text-peak-muted" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-peak-muted">{modal.body}</p>
            </div>
            <div className="p-6 border-t border-peak-border flex justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
