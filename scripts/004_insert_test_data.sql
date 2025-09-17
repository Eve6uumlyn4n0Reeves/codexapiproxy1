-- 插入测试兑换码
INSERT INTO public.redemption_codes (code, plan_type, token_limit, expires_at) VALUES
  ('DAILY-TEST-001', 'daily', 10000, NOW() + INTERVAL '30 days'),
  ('DAILY-TEST-002', 'daily', 10000, NOW() + INTERVAL '30 days'),
  ('WEEKLY-TEST-001', 'weekly', 100000, NOW() + INTERVAL '30 days'),
  ('WEEKLY-TEST-002', 'weekly', 100000, NOW() + INTERVAL '30 days'),
  ('MONTHLY-TEST-001', 'monthly', 500000, NOW() + INTERVAL '30 days'),
  ('MONTHLY-TEST-002', 'monthly', 500000, NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;
