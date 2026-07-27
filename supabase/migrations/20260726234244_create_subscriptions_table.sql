/*
# Create subscriptions table (single-tenant, no auth)

1. New Tables
- `subscriptions`
  - `id` (uuid, primary key)
  - `customer_name` (text, not null) — name of the subscribing customer
  - `email` (text, not null) — contact email, validated on the client
  - `plan` (text, not null) — plan tier: 'Starter' | 'Pro' | 'Enterprise'
  - `mrr` (numeric, not null) — monthly recurring revenue in USD, must be >= 0
  - `contract_duration_months` (integer, not null, default 12) — length of the contract
  - `status` (text, not null, default 'Active') — 'Active' | 'Churned' | 'Trialing'
  - `start_date` (date, not null, default today) — when the subscription began
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `subscriptions`.
- Single-tenant dashboard with no sign-in: allow anon + authenticated full CRUD
  because the data is intentionally shared/public across the workspace.
3. Indexes
- Index on `start_date` for date-range filtering performance.
- Index on `status` for churn calculations.
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('Starter', 'Pro', 'Enterprise')),
  mrr numeric NOT NULL DEFAULT 0 CHECK (mrr >= 0),
  contract_duration_months integer NOT NULL DEFAULT 12 CHECK (contract_duration_months >= 0),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Churned', 'Trialing')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_select_subscriptions ON subscriptions FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY anon_insert_subscriptions ON subscriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY anon_update_subscriptions ON subscriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY anon_delete_subscriptions ON subscriptions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

INSERT INTO subscriptions (customer_name, email, plan, mrr, contract_duration_months, status, start_date)
SELECT * FROM (VALUES
  ('Acme Corp', 'billing@acme.com', 'Enterprise', 4200.00, 24, 'Active', DATE '2024-08-15'),
  ('Globex Inc', 'accounts@globex.com', 'Pro', 1200.00, 12, 'Active', DATE '2024-11-02'),
  ('Initech', 'ap@initech.com', 'Starter', 199.00, 12, 'Churned', DATE '2024-03-21'),
  ('Umbrella LLC', 'pay@umbrella.com', 'Pro', 850.00, 12, 'Active', DATE '2025-01-10'),
  ('Soylent Co', 'finance@soylent.com', 'Enterprise', 6800.00, 36, 'Active', DATE '2024-06-30'),
  ('Hooli', 'ops@hooli.com', 'Starter', 99.00, 6, 'Trialing', DATE '2025-02-14'),
  ('Pied Piper', 'hello@piedpiper.com', 'Pro', 1500.00, 12, 'Active', DATE '2025-03-05'),
  ('Stark Industries', 'pepper@stark.com', 'Enterprise', 9500.00, 24, 'Active', DATE '2024-09-19'),
  ('Wayne Enterprises', 'lucius@wayne.com', 'Pro', 2200.00, 12, 'Churned', DATE '2024-04-12'),
  ('Wonka Inc', 'office@wonka.com', 'Starter', 149.00, 6, 'Active', DATE '2025-04-22')
) AS v(customer_name, email, plan, mrr, contract_duration_months, status, start_date)
WHERE NOT EXISTS (SELECT 1 FROM subscriptions LIMIT 1);
