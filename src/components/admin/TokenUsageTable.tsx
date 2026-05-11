import type { AdminMetrics } from '@/types'

interface TokenUsageTableProps {
  metrics: AdminMetrics
}

export function TokenUsageTable({ metrics }: TokenUsageTableProps) {
  const rows = [
    {
      type: 'Input Text',
      tokens: metrics.input_text_tokens_today,
      total: metrics.input_text_tokens_total,
      rate: '$0.50 / 1M',
      cost: metrics.cost_input_text_today,
    },
    {
      type: 'Output Text',
      tokens: metrics.output_text_tokens_today,
      total: metrics.output_text_tokens_total,
      rate: '$2.00 / 1M',
      cost: metrics.cost_output_text_today,
    },
    {
      type: 'Input Audio',
      tokens: metrics.input_audio_tokens_today,
      total: metrics.input_audio_tokens_total,
      rate: '$3.00 / 1M',
      cost: metrics.cost_input_audio_today,
    },
    {
      type: 'Output Audio',
      tokens: metrics.output_audio_tokens_today,
      total: metrics.output_audio_tokens_total,
      rate: '$12.00 / 1M',
      cost: metrics.cost_output_audio_today,
    },
    {
      type: 'Summary Input',
      tokens: metrics.summary_input_tokens_today,
      total: metrics.summary_input_tokens_total,
      rate: '$1.00 / 1M',
      cost: metrics.cost_summary_input_today,
    },
    {
      type: 'Summary Output',
      tokens: metrics.summary_output_tokens_today,
      total: metrics.summary_output_tokens_total,
      rate: '$2.50 / 1M',
      cost: metrics.cost_summary_output_today,
    },
  ]

  return (
    <div className="bg-pm-surface border border-pm-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-pm-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-pm-primary">TOKEN USAGE & COST</h2>
        <span className="text-[10px] font-bold text-pm-muted uppercase tracking-widest bg-pm-surface border border-pm-border px-2 py-1 rounded-md">
          Last 24 Hours
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-pm-border">
              <th className="px-5 py-3 text-[10px] font-bold text-pm-muted uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-[10px] font-bold text-pm-muted uppercase tracking-wider text-right">Tokens (24h)</th>
              <th className="px-5 py-3 text-[10px] font-bold text-pm-muted uppercase tracking-wider text-right">All-Time</th>
              <th className="px-5 py-3 text-[10px] font-bold text-pm-muted uppercase tracking-wider">Rate</th>
              <th className="px-5 py-3 text-[10px] font-bold text-pm-muted uppercase tracking-wider text-right">Cost (24h)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pm-border">
            {rows.map((row) => (
              <tr key={row.type} className="hover:bg-pm-teal/5 transition-colors group">
                <td className="px-5 py-3.5">
                  <span className="text-sm font-semibold text-pm-primary group-hover:text-pm-teal transition-colors">{row.type}</span>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-sm text-pm-primary">
                  {row.tokens.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs text-pm-muted">
                  {row.total.toLocaleString()}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[11px] font-bold text-pm-muted bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                    {row.rate}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-sm font-bold text-pm-teal">
                    ${row.cost.toFixed(4)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-pm-teal/5 lg:bg-transparent lg:border-t lg:border-pm-border">
              <td className="px-5 py-4 text-sm font-bold text-pm-primary">Current Spend</td>
              <td className="px-5 py-4 text-right font-mono text-sm font-bold text-pm-primary">
                {metrics.total_tokens.toLocaleString()}
              </td>
              <td className="px-5 py-4" colSpan={2}></td>
              <td className="px-5 py-4 text-right underline decoration-pm-teal decoration-2 underline-offset-4">
                <span className="text-base font-extrabold text-pm-primary">
                  ${metrics.ai_cost_today_usd.toFixed(4)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
