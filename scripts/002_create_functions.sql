-- 创建用户注册触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 为用户表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建生成API密钥哈希的函数
CREATE OR REPLACE FUNCTION public.generate_api_key_hash(api_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(digest(api_key, 'sha256'), 'hex');
END;
$$;

-- 创建检查用户套餐的函数
CREATE OR REPLACE FUNCTION public.check_user_plan_limits(user_uuid UUID, tokens_to_use INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  active_plan RECORD;
BEGIN
  -- 查找用户的活跃套餐
  SELECT * INTO active_plan
  FROM public.user_plans
  WHERE user_id = user_uuid
    AND is_active = TRUE
    AND expires_at > NOW()
  ORDER BY expires_at DESC
  LIMIT 1;
  
  -- 如果没有活跃套餐，返回false
  IF active_plan IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 检查是否超出限制
  IF (active_plan.tokens_used + tokens_to_use) > active_plan.token_limit THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;
