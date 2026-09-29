// SQL-примеры к бизнес-метрикам глоссария: ключ — id термина в glossary.js
// и glossary-en.js. Код один на обе локали, как в каталоге /metrics.
// Схема та же, что у карточек метрик (events, orders, users, marketing_spend,
// sessions, subscriptions); таблицы и колонки сверх неё названы в комментарии
// первой строкой, чтобы запрос читался без догадок.
export const glossarySql = {
  'north-star': `-- Orders delivered on time, per week
-- extra columns: orders.promised_at, orders.delivered_at
SELECT date_trunc('week', created_at) AS week,
       COUNT(*) AS delivered_orders,
       COUNT(*) FILTER (WHERE delivered_at <= promised_at) AS nsm_on_time
FROM orders
WHERE status = 'delivered'
GROUP BY 1
ORDER BY 1;`,

  'dau-mau': `-- Average DAU over September divided by September MAU
WITH period AS (
  SELECT user_id, date_trunc('day', ts) AS day
  FROM events
  WHERE ts >= '2026-09-01' AND ts < '2026-10-01'
),
daily AS (
  SELECT day, COUNT(DISTINCT user_id) AS dau
  FROM period
  GROUP BY 1
),
monthly AS (
  SELECT COUNT(DISTINCT user_id) AS mau FROM period
)
SELECT ROUND(AVG(d.dau)) AS avg_dau,
       m.mau,
       ROUND(AVG(d.dau) / m.mau, 2) AS stickiness
FROM daily d
CROSS JOIN monthly m
GROUP BY m.mau;`,

  retention: `-- Month-1 retention by monthly signup cohort
SELECT date_trunc('month', u.created_at) AS cohort,
       COUNT(DISTINCT u.user_id) AS cohort_size,
       COUNT(DISTINCT e.user_id) AS returned_m1,
       ROUND(100.0 * COUNT(DISTINCT e.user_id)
             / COUNT(DISTINCT u.user_id), 1) AS retention_m1_pct
FROM users u
LEFT JOIN events e
  ON e.user_id = u.user_id
 AND date_trunc('month', e.ts)
     = date_trunc('month', u.created_at) + INTERVAL '1 month'
GROUP BY 1
ORDER BY 1;`,

  'd1-d7-d30': `-- D1 / D7 / D30 by install day (install = users.created_at)
-- recent cohorts show 0 for days that have not happened yet
SELECT u.created_at::date AS install_day,
       COUNT(DISTINCT u.user_id) AS installs,
       ROUND(100.0 * COUNT(DISTINCT e.user_id)
         FILTER (WHERE e.ts::date = u.created_at::date + 1)
         / COUNT(DISTINCT u.user_id), 1) AS d1_pct,
       ROUND(100.0 * COUNT(DISTINCT e.user_id)
         FILTER (WHERE e.ts::date = u.created_at::date + 7)
         / COUNT(DISTINCT u.user_id), 1) AS d7_pct,
       ROUND(100.0 * COUNT(DISTINCT e.user_id)
         FILTER (WHERE e.ts::date = u.created_at::date + 30)
         / COUNT(DISTINCT u.user_id), 1) AS d30_pct
FROM users u
LEFT JOIN events e ON e.user_id = u.user_id
GROUP BY 1
ORDER BY 1;`,

  churn: `-- Monthly churn: cancelled during the month / active at its start
WITH months AS (
  SELECT m::date AS month
  FROM generate_series('2026-01-01'::date, '2026-09-01',
                       INTERVAL '1 month') AS m
),
counts AS (
  SELECT m.month,
         COUNT(*) FILTER (
           WHERE s.cancelled_at IS NULL OR s.cancelled_at >= m.month
         ) AS active_at_start,
         COUNT(*) FILTER (
           WHERE s.cancelled_at >= m.month
             AND s.cancelled_at < m.month + INTERVAL '1 month'
         ) AS churned
  FROM months m
  JOIN subscriptions s ON s.started_at < m.month
  GROUP BY 1
)
SELECT month, active_at_start, churned,
       ROUND(100.0 * churned / NULLIF(active_at_start, 0), 1) AS churn_pct
FROM counts
ORDER BY 1;`,

  nps: `-- NPS by month
-- extra table: nps_answers(user_id, answered_at, score)  -- score 0–10
SELECT date_trunc('month', answered_at) AS month,
       COUNT(*) AS answers,
       ROUND(100.0 * COUNT(*) FILTER (WHERE score >= 9) / COUNT(*)
           - 100.0 * COUNT(*) FILTER (WHERE score <= 6) / COUNT(*), 1) AS nps
FROM nps_answers
GROUP BY 1
ORDER BY 1;`,

  guardrails: `-- Target metric and guardrails side by side, per variant
-- extra table: ab_assignments(user_id, variant)
SELECT a.variant,
       COUNT(DISTINCT a.user_id) AS users,
       ROUND(100.0 * COUNT(DISTINCT o.user_id)
             / COUNT(DISTINCT a.user_id), 2) AS conversion_pct,
       ROUND(100.0 * COUNT(DISTINCT o.order_id)
               FILTER (WHERE o.status = 'cancelled')
             / NULLIF(COUNT(DISTINCT o.order_id), 0), 2) AS cancel_rate_pct,
       ROUND(100.0 * COUNT(DISTINCT e.user_id)
             / COUNT(DISTINCT a.user_id), 2) AS unsubscribe_pct
FROM ab_assignments a
LEFT JOIN orders o ON o.user_id = a.user_id
LEFT JOIN events e
  ON e.user_id = a.user_id AND e.event_name = 'unsubscribe'
GROUP BY 1;`,

  'conversion-rate': `-- Weekly visitor → order and cart → order conversion
WITH funnel AS (
  SELECT date_trunc('week', ts) AS week,
         COUNT(DISTINCT user_id) AS visitors,
         COUNT(DISTINCT user_id)
           FILTER (WHERE event_name = 'add_to_cart') AS carted,
         COUNT(DISTINCT user_id)
           FILTER (WHERE event_name = 'order_placed') AS ordered
  FROM events
  GROUP BY 1
)
SELECT week, visitors, carted, ordered,
       ROUND(100.0 * ordered / visitors, 1) AS visit_to_order_pct,
       ROUND(100.0 * ordered / NULLIF(carted, 0), 1) AS cart_to_order_pct
FROM funnel
ORDER BY 1;`,

  'trial-paid': `-- Trial → paid by trial start month
-- extra table: trials(user_id, started_at)
-- paid = a subscription started within 30 days of the trial start
SELECT date_trunc('month', t.started_at) AS trial_month,
       COUNT(DISTINCT t.user_id) AS trials,
       COUNT(DISTINCT s.user_id) AS paid,
       ROUND(100.0 * COUNT(DISTINCT s.user_id)
             / COUNT(DISTINCT t.user_id), 1) AS trial_to_paid_pct
FROM trials t
LEFT JOIN subscriptions s
  ON s.user_id = t.user_id
 AND s.started_at >= t.started_at
 AND s.started_at < t.started_at + INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;`,

  ctr: `-- CTR by campaign: total clicks / total impressions
-- (not an average of daily CTRs — that overweights quiet days)
-- extra table: ad_stats(dt, campaign, impressions, clicks, spend)
SELECT campaign,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks,
       ROUND(100.0 * SUM(clicks) / NULLIF(SUM(impressions), 0), 2) AS ctr_pct
FROM ad_stats
WHERE dt >= '2026-09-01' AND dt < '2026-10-01'
GROUP BY 1
ORDER BY ctr_pct DESC;`,

  'look-to-book': `-- Look-to-book by month
-- extra table: search_sessions(session_id, user_id, started_at)
WITH looks AS (
  SELECT date_trunc('month', started_at) AS month, COUNT(*) AS searches
  FROM search_sessions
  GROUP BY 1
),
books AS (
  SELECT date_trunc('month', created_at) AS month, COUNT(*) AS bookings
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
)
SELECT month, l.searches, b.bookings,
       ROUND(100.0 * b.bookings / l.searches, 2) AS look_to_book_pct
FROM looks l
LEFT JOIN books b USING (month)
ORDER BY 1;`,

  arpu: `-- Monthly ARPU and ARPPU (active = any event in the month)
WITH active AS (
  SELECT date_trunc('month', ts) AS month,
         COUNT(DISTINCT user_id) AS users
  FROM events
  GROUP BY 1
),
paid AS (
  SELECT date_trunc('month', created_at) AS month,
         SUM(amount) AS revenue,
         COUNT(DISTINCT user_id) AS payers
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
)
SELECT month, a.users, p.payers, p.revenue,
       ROUND(p.revenue / a.users, 2) AS arpu,
       ROUND(p.revenue / NULLIF(p.payers, 0), 2) AS arppu
FROM active a
LEFT JOIN paid p USING (month)
ORDER BY 1;`,

  aov: `-- Daily AOV next to the median order, to catch outliers
SELECT created_at::date AS day,
       COUNT(*) AS orders,
       ROUND(SUM(amount) / COUNT(*), 2) AS aov,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_order
FROM orders
WHERE status = 'paid'
GROUP BY 1
ORDER BY 1;`,

  ltv: `-- Simple subscription LTV = ARPU × margin / monthly churn
-- margin 0.6 is an input from finance, not from the data
WITH base AS (
  SELECT *
  FROM subscriptions
  WHERE started_at < DATE '2026-09-01'
    AND (cancelled_at IS NULL OR cancelled_at >= DATE '2026-09-01')
),
stats AS (
  SELECT AVG(mrr) AS arpu,
         1.0 * COUNT(*) FILTER (WHERE cancelled_at < DATE '2026-10-01')
             / COUNT(*) AS churn
  FROM base
)
SELECT ROUND(arpu, 2) AS arpu,
       ROUND(churn, 4) AS monthly_churn,
       ROUND(arpu * 0.6 / NULLIF(churn, 0)) AS ltv
FROM stats;`,

  'contribution-margin': `-- Contribution margin per month
-- extra table: order_costs(order_id, cost_type, amount)
--   cost_type: food, courier, packaging, card_fee
WITH costs AS (
  SELECT order_id, SUM(amount) AS variable_costs
  FROM order_costs
  GROUP BY 1
)
SELECT date_trunc('month', o.created_at) AS month,
       SUM(o.amount) AS revenue,
       SUM(c.variable_costs) AS variable_costs,
       SUM(o.amount) - SUM(c.variable_costs) AS contribution_margin,
       ROUND(100.0 * (SUM(o.amount) - SUM(c.variable_costs))
             / SUM(o.amount), 1) AS margin_pct
FROM orders o
JOIN costs c USING (order_id)
WHERE o.status = 'paid'
GROUP BY 1
ORDER BY 1;`,

  bookings: `-- Bookings (what players paid) vs revenue recognized as currency is spent
-- extra table: currency_spend(user_id, ts, value)  -- spent currency in money
WITH b AS (
  SELECT date_trunc('month', created_at) AS month, SUM(amount) AS bookings
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
),
r AS (
  SELECT date_trunc('month', ts) AS month, SUM(value) AS recognized
  FROM currency_spend
  GROUP BY 1
)
SELECT month, b.bookings, r.recognized,
       b.bookings - COALESCE(r.recognized, 0) AS deferred
FROM b
LEFT JOIN r USING (month)
ORDER BY 1;`,

  mrr: `-- MRR on the first day of each month
-- subscriptions.mrr is already monthly: an annual plan is stored as price / 12
SELECT m::date AS month,
       COUNT(*) AS active_subscriptions,
       SUM(s.mrr) AS mrr
FROM generate_series('2026-01-01'::date, '2026-09-01',
                     INTERVAL '1 month') AS m
JOIN subscriptions s
  ON s.started_at <= m
 AND (s.cancelled_at IS NULL OR s.cancelled_at > m)
GROUP BY 1
ORDER BY 1;`,

  arr: `-- ARR as today's MRR × 12
SELECT SUM(mrr) AS mrr,
       SUM(mrr) * 12 AS arr
FROM subscriptions
WHERE started_at <= DATE '2026-09-01'
  AND (cancelled_at IS NULL OR cancelled_at > DATE '2026-09-01');`,

  nrr: `-- NRR: current MRR of the customers who paid 12 months ago
-- extra table: mrr_monthly(customer_id, month, mrr)
WITH year_ago AS (
  SELECT customer_id, mrr
  FROM mrr_monthly
  WHERE month = DATE '2025-09-01'
),
this_month AS (
  SELECT customer_id, mrr
  FROM mrr_monthly
  WHERE month = DATE '2026-09-01'
)
SELECT SUM(y.mrr) AS mrr_year_ago,
       SUM(COALESCE(t.mrr, 0)) AS mrr_same_customers_now,
       ROUND(100.0 * SUM(COALESCE(t.mrr, 0)) / SUM(y.mrr), 1) AS nrr_pct
FROM year_ago y
LEFT JOIN this_month t USING (customer_id);  -- new customers never join in`,

  acv: `-- ACV and TCV of contracts signed per quarter
-- extra table: contracts(contract_id, customer_id, signed_at,
--                        total_value, term_months)
SELECT date_trunc('quarter', signed_at) AS quarter,
       COUNT(*) AS contracts,
       SUM(total_value) AS tcv,
       ROUND(SUM(total_value * 12.0 / GREATEST(term_months, 12))) AS acv,
       ROUND(AVG(total_value * 12.0 / GREATEST(term_months, 12))) AS avg_acv
FROM contracts
GROUP BY 1
ORDER BY 1;`,

  cac: `-- Monthly CAC: acquisition spend / new paying customers
-- add sales payroll to marketing_spend if it serves acquisition
WITH spend AS (
  SELECT date_trunc('month', dt) AS month, SUM(spend) AS spend
  FROM marketing_spend
  GROUP BY 1
),
first_paid AS (
  SELECT user_id, MIN(created_at) AS first_paid_at
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
),
new_customers AS (
  SELECT date_trunc('month', first_paid_at) AS month, COUNT(*) AS n
  FROM first_paid
  GROUP BY 1
)
SELECT month, s.spend, c.n AS new_customers,
       ROUND(s.spend / NULLIF(c.n, 0), 2) AS cac
FROM spend s
LEFT JOIN new_customers c USING (month)
ORDER BY 1;`,

  cpi: `-- CPI by channel for September
-- extra table: installs(user_id, installed_at, channel)
WITH spend AS (
  SELECT channel, SUM(spend) AS spend
  FROM marketing_spend
  WHERE dt >= '2026-09-01' AND dt < '2026-10-01'
  GROUP BY 1
),
inst AS (
  SELECT channel, COUNT(*) AS installs
  FROM installs
  WHERE installed_at >= '2026-09-01' AND installed_at < '2026-10-01'
  GROUP BY 1
)
SELECT channel, s.spend, i.installs,
       ROUND(s.spend / NULLIF(i.installs, 0), 2) AS cpi
FROM spend s
JOIN inst i USING (channel)
ORDER BY cpi;`,

  cpc: `-- CPC by campaign and week
-- extra table: ad_stats(dt, campaign, impressions, clicks, spend)
SELECT date_trunc('week', dt) AS week,
       campaign,
       SUM(clicks) AS clicks,
       SUM(spend) AS spend,
       ROUND(SUM(spend) / NULLIF(SUM(clicks), 0), 2) AS cpc
FROM ad_stats
GROUP BY 1, 2
ORDER BY 1, 2;`,

  roas: `-- ROAS and ad-cost share by channel for September
-- extra column: orders.channel (attributed ad channel, NULL = organic)
WITH spend AS (
  SELECT channel, SUM(spend) AS spend
  FROM marketing_spend
  WHERE dt >= '2026-09-01' AND dt < '2026-10-01'
  GROUP BY 1
),
rev AS (
  SELECT channel, SUM(amount) AS revenue
  FROM orders
  WHERE status = 'paid'
    AND created_at >= '2026-09-01' AND created_at < '2026-10-01'
  GROUP BY 1
)
SELECT channel, s.spend, r.revenue,
       ROUND(r.revenue / NULLIF(s.spend, 0), 2) AS roas,
       ROUND(100.0 * s.spend / NULLIF(r.revenue, 0), 1) AS ad_cost_share_pct
FROM spend s
LEFT JOIN rev r USING (channel)
ORDER BY roas DESC NULLS LAST;`,

  tac: `-- TAC and its share of ad revenue, by quarter
-- extra tables: ad_revenue(dt, amount), partner_payouts(dt, partner, amount)
WITH rev AS (
  SELECT date_trunc('quarter', dt) AS quarter, SUM(amount) AS ad_revenue
  FROM ad_revenue
  GROUP BY 1
),
tac AS (
  SELECT date_trunc('quarter', dt) AS quarter, SUM(amount) AS tac
  FROM partner_payouts
  GROUP BY 1
)
SELECT quarter, r.ad_revenue, t.tac,
       ROUND(100.0 * t.tac / r.ad_revenue, 1) AS tac_share_pct
FROM rev r
JOIN tac t USING (quarter)
ORDER BY 1;`,

  rpm: `-- RPM per video for September
-- extra table: video_daily(video_id, dt, views, creator_revenue)
SELECT video_id,
       SUM(views) AS views,
       SUM(creator_revenue) AS revenue,
       ROUND(1000.0 * SUM(creator_revenue) / NULLIF(SUM(views), 0), 2) AS rpm
FROM video_daily
WHERE dt >= '2026-09-01' AND dt < '2026-10-01'
GROUP BY 1
ORDER BY views DESC;`,

  gmv: `-- GMV (all placed orders) next to net sales
SELECT date_trunc('month', created_at) AS month,
       SUM(amount) AS gmv,
       SUM(amount) FILTER (
         WHERE status NOT IN ('cancelled', 'returned')
       ) AS net_sales
FROM orders
GROUP BY 1
ORDER BY 1;`,

  'take-rate': `-- Take rate: (commissions + seller ads) / GMV
-- extra: orders.commission, seller_ads(dt, seller_id, amount)
WITH o AS (
  SELECT date_trunc('month', created_at) AS month,
         SUM(amount) AS gmv,
         SUM(commission) AS commissions
  FROM orders
  GROUP BY 1
),
ads AS (
  SELECT date_trunc('month', dt) AS month, SUM(amount) AS ads_revenue
  FROM seller_ads
  GROUP BY 1
)
SELECT month, o.gmv, o.commissions,
       COALESCE(a.ads_revenue, 0) AS ads_revenue,
       ROUND(100.0 * (o.commissions + COALESCE(a.ads_revenue, 0))
             / o.gmv, 1) AS take_rate_pct
FROM o
LEFT JOIN ads a USING (month)
ORDER BY 1;`,

  tpv: `-- TPV and the effective fee rate, by quarter
-- extra table: payments(payment_id, merchant_id, created_at,
--                       amount, fee, status)
SELECT date_trunc('quarter', created_at) AS quarter,
       COUNT(*) AS payments,
       SUM(amount) AS tpv,
       SUM(fee) AS fee_revenue,
       ROUND(100.0 * SUM(fee) / SUM(amount), 2) AS fee_rate_pct
FROM payments
WHERE status = 'succeeded'
GROUP BY 1
ORDER BY 1;`,

  gbv: `-- Summer GBV by product, gross and net of cancellations
-- extra table: trip_bookings(booking_id, created_at, product,
--                            amount, status)
SELECT product,
       SUM(amount) AS gbv,
       SUM(amount) FILTER (WHERE status <> 'cancelled') AS gbv_net
FROM trip_bookings
WHERE created_at >= '2026-06-01' AND created_at < '2026-09-01'
GROUP BY 1
ORDER BY gbv DESC;`,

  'match-rate': `-- Match rate by hour
-- extra table: ride_requests(request_id, created_at, matched_at)
SELECT date_trunc('hour', created_at) AS hour,
       COUNT(*) AS requests,
       COUNT(matched_at) AS matched,
       ROUND(100.0 * COUNT(matched_at) / COUNT(*), 1) AS match_rate_pct
FROM ride_requests
GROUP BY 1
ORDER BY 1;`,

  'same-store-sales': `-- Same-store sales growth: September 2026 vs September 2025
-- extra column: orders.location_id
WITH s AS (
  SELECT location_id,
         SUM(amount) FILTER (WHERE created_at >= '2025-09-01'
                               AND created_at < '2025-10-01') AS sales_ly,
         SUM(amount) FILTER (WHERE created_at >= '2026-09-01'
                               AND created_at < '2026-10-01') AS sales_ty
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
)
SELECT COUNT(*) AS comparable_locations,
       SUM(sales_ly) AS sales_last_year,
       SUM(sales_ty) AS sales_this_year,
       ROUND(100.0 * (SUM(sales_ty) - SUM(sales_ly))
             / SUM(sales_ly), 1) AS same_store_growth_pct
FROM s
WHERE sales_ly > 0 AND sales_ty > 0;  -- open in both periods`,

  eta: `-- ETA accuracy: share on time (5 min grace) and median delay
-- extra columns: orders.promised_at, orders.delivered_at
SELECT date_trunc('week', created_at) AS week,
       COUNT(*) AS orders,
       ROUND(100.0 * COUNT(*) FILTER (
               WHERE delivered_at <= promised_at + INTERVAL '5 minutes'
             ) / COUNT(*), 1) AS on_time_pct,
       PERCENTILE_CONT(0.5) WITHIN GROUP (
         ORDER BY EXTRACT(epoch FROM delivered_at - promised_at) / 60
       ) AS median_delay_min
FROM orders
WHERE status = 'delivered'
GROUP BY 1
ORDER BY 1;`,

  cpm: `-- CPM by campaign for September
-- extra table: ad_stats(dt, campaign, impressions, clicks, spend)
SELECT campaign,
       SUM(impressions) AS impressions,
       SUM(spend) AS spend,
       ROUND(1000.0 * SUM(spend) / NULLIF(SUM(impressions), 0), 2) AS cpm,
       ROUND(SUM(spend) / NULLIF(SUM(clicks), 0), 2) AS cpc
FROM ad_stats
WHERE dt >= '2026-09-01' AND dt < '2026-10-01'
GROUP BY 1
ORDER BY cpm;`,

  'activation-rate': `-- Activation: first project created within 24h of signup, by week
SELECT date_trunc('week', u.created_at) AS signup_week,
       COUNT(DISTINCT u.user_id) AS signups,
       COUNT(DISTINCT e.user_id) AS activated,
       ROUND(100.0 * COUNT(DISTINCT e.user_id)
             / COUNT(DISTINCT u.user_id), 1) AS activation_pct
FROM users u
LEFT JOIN events e
  ON e.user_id = u.user_id
 AND e.event_name = 'project_created'
 AND e.ts < u.created_at + INTERVAL '24 hours'
GROUP BY 1
ORDER BY 1;`,

  ttv: `-- Time to first value and the share who never reach it
WITH first_value AS (
  SELECT u.user_id, u.created_at,
         MIN(e.ts) FILTER (WHERE e.event_name = 'campaign_sent') AS value_at
  FROM users u
  LEFT JOIN events e ON e.user_id = u.user_id
  GROUP BY 1, 2
)
SELECT date_trunc('month', created_at) AS cohort,
       COUNT(*) AS signups,
       ROUND(100.0 * COUNT(*) FILTER (WHERE value_at IS NULL)
             / COUNT(*), 1) AS never_reached_pct,
       PERCENTILE_CONT(0.5) WITHIN GROUP (
         ORDER BY EXTRACT(epoch FROM value_at - created_at) / 3600
       ) AS median_ttv_hours
FROM first_value
GROUP BY 1
ORDER BY 1;`,

  'repeat-rate': `-- Repeat purchase within 90 days of the first order, by month
WITH firsts AS (
  SELECT user_id, MIN(created_at) AS first_at
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
)
SELECT date_trunc('month', f.first_at) AS first_order_month,
       COUNT(DISTINCT f.user_id) AS first_buyers,
       COUNT(DISTINCT o.user_id) AS repeat_buyers,
       ROUND(100.0 * COUNT(DISTINCT o.user_id)
             / COUNT(DISTINCT f.user_id), 1) AS repeat_90d_pct
FROM firsts f
LEFT JOIN orders o
  ON o.user_id = f.user_id
 AND o.status = 'paid'
 AND o.created_at > f.first_at
 AND o.created_at <= f.first_at + INTERVAL '90 days'
GROUP BY 1
ORDER BY 1;`,

  'paying-share': `-- Paying share, ARPPU and ARPU by month: ARPU = share × ARPPU
WITH active AS (
  SELECT date_trunc('month', ts) AS month,
         COUNT(DISTINCT user_id) AS users
  FROM events
  GROUP BY 1
),
paid AS (
  SELECT date_trunc('month', created_at) AS month,
         COUNT(DISTINCT user_id) AS payers,
         SUM(amount) AS revenue
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
)
SELECT month, a.users, p.payers,
       ROUND(100.0 * p.payers / a.users, 2) AS paying_share_pct,
       ROUND(p.revenue / NULLIF(p.payers, 0), 2) AS arppu,
       ROUND(p.revenue / a.users, 2) AS arpu
FROM active a
LEFT JOIN paid p USING (month)
ORDER BY 1;`,

  grr: `-- GRR next to NRR for the customers who paid 12 months ago
-- extra table: mrr_monthly(customer_id, month, mrr)
WITH year_ago AS (
  SELECT customer_id, mrr
  FROM mrr_monthly
  WHERE month = DATE '2025-09-01'
),
this_month AS (
  SELECT customer_id, mrr
  FROM mrr_monthly
  WHERE month = DATE '2026-09-01'
)
SELECT SUM(y.mrr) AS mrr_year_ago,
       -- expansion is capped: a customer counts at most at last year's MRR
       ROUND(100.0 * SUM(LEAST(COALESCE(t.mrr, 0), y.mrr))
             / SUM(y.mrr), 1) AS grr_pct,
       ROUND(100.0 * SUM(COALESCE(t.mrr, 0)) / SUM(y.mrr), 1) AS nrr_pct
FROM year_ago y
LEFT JOIN this_month t USING (customer_id);`,

  csat: `-- CSAT by topic for September
-- extra table: csat_answers(ticket_id, answered_at, topic, score)  -- score 1–5
SELECT topic,
       COUNT(*) AS answers,
       ROUND(100.0 * COUNT(*) FILTER (WHERE score >= 4) / COUNT(*), 1) AS csat_pct
FROM csat_answers
WHERE answered_at >= '2026-09-01' AND answered_at < '2026-10-01'
GROUP BY 1
ORDER BY csat_pct;`,

  'k-factor': `-- K-factor of September signups
-- extra table: invites(inviter_id, sent_at, invitee_id)  -- invitee_id set on signup
WITH senders AS (
  SELECT user_id
  FROM users
  WHERE created_at >= '2026-09-01' AND created_at < '2026-10-01'
),
inv AS (
  SELECT COUNT(*) AS invites,
         COUNT(i.invitee_id) AS accepted
  FROM invites i
  JOIN senders s ON s.user_id = i.inviter_id
)
SELECT (SELECT COUNT(*) FROM senders) AS users,
       invites, accepted,
       ROUND(1.0 * invites / (SELECT COUNT(*) FROM senders), 2) AS invites_per_user,
       ROUND(1.0 * accepted / NULLIF(invites, 0), 3) AS invite_conversion,
       ROUND(1.0 * accepted / (SELECT COUNT(*) FROM senders), 3) AS k_factor
FROM inv;`,

  'ltv-cac': `-- LTV/CAC by acquisition channel for H1 2025 signups
-- LTV = realized 12-month gross profit per signup; margin 0.6 is an input
-- extra column: users.channel
WITH cohort AS (
  SELECT user_id, channel, created_at
  FROM users
  WHERE created_at >= '2025-01-01' AND created_at < '2025-07-01'
),
cohort_value AS (
  SELECT c.channel,
         COUNT(DISTINCT c.user_id) AS signups,
         0.6 * COALESCE(SUM(o.amount), 0) / COUNT(DISTINCT c.user_id) AS ltv_12m
  FROM cohort c
  LEFT JOIN orders o
    ON o.user_id = c.user_id
   AND o.status = 'paid'
   AND o.created_at < c.created_at + INTERVAL '12 months'
  GROUP BY 1
),
spend AS (
  SELECT channel, SUM(spend) AS spend
  FROM marketing_spend
  WHERE dt >= '2025-01-01' AND dt < '2025-07-01'
  GROUP BY 1
)
SELECT v.channel, v.signups,
       ROUND(v.ltv_12m, 2) AS ltv_12m,
       ROUND(s.spend / v.signups, 2) AS cac,
       ROUND(v.ltv_12m / NULLIF(s.spend / v.signups, 0), 2) AS ltv_cac
FROM cohort_value v
JOIN spend s USING (channel)
ORDER BY ltv_cac DESC;`,

  payback: `-- CAC payback of the January cohort: cumulative gross profit per signup
-- by month since signup; payback = first month where it reaches CAC
-- cac and margin are inputs
WITH params AS (
  SELECT 1500.0 AS cac, 0.6 AS margin
),
cohort AS (
  SELECT user_id, created_at
  FROM users
  WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'
),
monthly AS (
  SELECT (EXTRACT(year FROM age(o.created_at, c.created_at)) * 12
          + EXTRACT(month FROM age(o.created_at, c.created_at)))::int AS month_n,
         SUM(o.amount) AS revenue
  FROM cohort c
  JOIN orders o ON o.user_id = c.user_id AND o.status = 'paid'
  GROUP BY 1
)
SELECT m.month_n,
       ROUND(SUM(m.revenue * p.margin) OVER (ORDER BY m.month_n)
             / (SELECT COUNT(*) FROM cohort), 2) AS cum_profit_per_user,
       p.cac
FROM monthly m
CROSS JOIN params p
ORDER BY 1;`,

  'cancellation-rate': `-- Cancellation rate by initiator, weekly
-- extra column: orders.cancelled_by ('customer' | 'merchant' | 'service')
SELECT date_trunc('week', created_at) AS week,
       COUNT(*) AS placed,
       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled')
             / COUNT(*), 2) AS cancel_pct,
       COUNT(*) FILTER (WHERE cancelled_by = 'merchant') AS by_merchant,
       COUNT(*) FILTER (WHERE cancelled_by = 'customer') AS by_customer,
       COUNT(*) FILTER (WHERE cancelled_by = 'service') AS by_service
FROM orders
GROUP BY 1
ORDER BY 1;`,
}
