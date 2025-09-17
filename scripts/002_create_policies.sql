-- 用户表的RLS策略
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 管理员可以查看所有用户
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- API密钥表的RLS策略
CREATE POLICY "api_keys_select_own" ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "api_keys_insert_own" ON public.api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "api_keys_update_own" ON public.api_keys
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "api_keys_delete_own" ON public.api_keys
  FOR DELETE USING (user_id = auth.uid());

-- 兑换码表的RLS策略（只有管理员可以管理）
CREATE POLICY "redemption_codes_select_admin" ON public.redemption_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "redemption_codes_insert_admin" ON public.redemption_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 用户套餐表的RLS策略
CREATE POLICY "user_plans_select_own" ON public.user_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_plans_insert_own" ON public.user_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 管理员可以查看所有套餐
CREATE POLICY "user_plans_select_admin" ON public.user_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 使用日志表的RLS策略
CREATE POLICY "usage_logs_select_own" ON public.usage_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "usage_logs_insert_own" ON public.usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 管理员可以查看所有使用日志
CREATE POLICY "usage_logs_select_admin" ON public.usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 密码重置令牌表的RLS策略（系统级操作，不需要用户级权限）
CREATE POLICY "password_reset_tokens_select_all" ON public.password_reset_tokens
  FOR SELECT USING (true);

CREATE POLICY "password_reset_tokens_insert_all" ON public.password_reset_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "password_reset_tokens_update_all" ON public.password_reset_tokens
  FOR UPDATE USING (true);
