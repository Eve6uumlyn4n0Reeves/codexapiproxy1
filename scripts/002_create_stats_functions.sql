-- 创建用户统计函数
CREATE OR REPLACE FUNCTION get_user_stats(start_date timestamp, end_date timestamp)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total', (SELECT COUNT(*) FROM users),
    'new', (SELECT COUNT(*) FROM users WHERE created_at >= start_date AND created_at <= end_date),
    'active', (SELECT COUNT(DISTINCT user_id) FROM usage_logs WHERE created_at >= start_date AND created_at <= end_date),
    'verified', (SELECT COUNT(*) FROM users WHERE is_verified = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建API统计函数
CREATE OR REPLACE FUNCTION get_api_stats(start_date timestamp, end_date timestamp)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalRequests', COALESCE((SELECT COUNT(*) FROM usage_logs WHERE created_at >= start_date AND created_at <= end_date), 0),
    'totalTokens', COALESCE((SELECT SUM(total_tokens) FROM usage_logs WHERE created_at >= start_date AND created_at <= end_date), 0),
    'totalCost', COALESCE((SELECT SUM(cost) FROM usage_logs WHERE created_at >= start_date AND created_at <= end_date), 0),
    'errorRate', COALESCE((
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE (COUNT(*) FILTER (WHERE total_tokens = 0) * 100.0 / COUNT(*))
        END
      FROM usage_logs 
      WHERE created_at >= start_date AND created_at <= end_date
    ), 0),
    'avgResponseTime', COALESCE((
      SELECT AVG(
        CASE 
          WHEN total_tokens > 0 THEN total_tokens * 0.1 -- 模拟响应时间计算
          ELSE 500
        END
      )
      FROM usage_logs 
      WHERE created_at >= start_date AND created_at <= end_date
    ), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建兑换码统计函数
CREATE OR REPLACE FUNCTION get_redemption_stats(start_date timestamp, end_date timestamp)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalCodes', (SELECT COUNT(*) FROM redemption_codes WHERE created_at >= start_date AND created_at <= end_date),
    'usedCodes', (SELECT COUNT(*) FROM redemption_codes WHERE is_used = true AND created_at >= start_date AND created_at <= end_date),
    'unusedCodes', (SELECT COUNT(*) FROM redemption_codes WHERE is_used = false AND created_at >= start_date AND created_at <= end_date),
    'expiredCodes', (SELECT COUNT(*) FROM redemption_codes WHERE expires_at < NOW() AND created_at >= start_date AND created_at <= end_date)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建收入统计函数（暂时返回模拟数据）
CREATE OR REPLACE FUNCTION get_revenue_stats(start_date timestamp, end_date timestamp)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total', 0,
    'monthly', 0,
    'growth', 0
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建系统健康检查函数
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS json AS $$
DECLARE
  result json;
  db_connections int;
  max_connections int;
BEGIN
  -- 获取数据库连接数
  SELECT COUNT(*) INTO db_connections FROM pg_stat_activity WHERE state = 'active';
  SELECT setting::int INTO max_connections FROM pg_settings WHERE name = 'max_connections';
  
  SELECT json_build_object(
    'database', CASE 
      WHEN db_connections < max_connections * 0.8 THEN 'healthy'
      WHEN db_connections < max_connections * 0.9 THEN 'warning'
      ELSE 'critical'
    END,
    'api', 'healthy',
    'storage', 'healthy',
    'connections', db_connections,
    'maxConnections', max_connections
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建每日统计更新函数
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS void AS $$
DECLARE
  today date := CURRENT_DATE;
  total_users int;
  active_users int;
  total_requests int;
  total_tokens int;
  total_cost decimal;
BEGIN
  -- 计算统计数据
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(DISTINCT user_id) INTO active_users FROM usage_logs WHERE DATE(created_at) = today;
  SELECT COUNT(*) INTO total_requests FROM usage_logs WHERE DATE(created_at) = today;
  SELECT COALESCE(SUM(total_tokens), 0) INTO total_tokens FROM usage_logs WHERE DATE(created_at) = today;
  SELECT COALESCE(SUM(cost), 0) INTO total_cost FROM usage_logs WHERE DATE(created_at) = today;
  
  -- 插入或更新统计数据
  INSERT INTO system_stats (date, total_users, active_users, total_requests, total_tokens, total_cost)
  VALUES (today, total_users, active_users, total_requests, total_tokens, total_cost)
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    total_requests = EXCLUDED.total_requests,
    total_tokens = EXCLUDED.total_tokens,
    total_cost = EXCLUDED.total_cost,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
