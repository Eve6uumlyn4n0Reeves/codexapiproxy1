-- 插入一些测试兑换码
INSERT INTO public.redemption_codes (code, plan_type, token_limit, expires_at) VALUES
('DAILY001', 'daily', 10000, NOW() + INTERVAL '30 days'),
('DAILY002', 'daily', 10000, NOW() + INTERVAL '30 days'),
('WEEKLY001', 'weekly', 100000, NOW() + INTERVAL '30 days'),
('WEEKLY002', 'weekly', 100000, NOW() + INTERVAL '30 days'),
('MONTHLY001', 'monthly', 500000, NOW() + INTERVAL '30 days'),
('MONTHLY002', 'monthly', 500000, NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;
