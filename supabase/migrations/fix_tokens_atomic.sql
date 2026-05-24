-- Atomic token deduction to prevent race conditions
-- Returns (success, new_tokens_used, tokens_limit)
-- Deducts only if sufficient tokens remain (atomic check+update in one SQL statement)
-- Also handles refunds (negative amount): clamps to 0, no limit check

CREATE OR REPLACE FUNCTION increment_tokens_used(p_user_id uuid, p_amount bigint)
RETURNS TABLE(success boolean, new_tokens_used bigint, tokens_limit bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used   bigint;
  v_limit  bigint;
BEGIN
  IF p_amount >= 0 THEN
    -- Deduction: only update if tokens_used + amount <= tokens_limit
    UPDATE public.users
    SET tokens_used = tokens_used + p_amount
    WHERE id = p_user_id
      AND tokens_used + p_amount <= public.users.tokens_limit
    RETURNING public.users.tokens_used, public.users.tokens_limit INTO v_used, v_limit;

    IF FOUND THEN
      RETURN QUERY SELECT true, v_used, v_limit;
    ELSE
      -- Insufficient tokens — return current state
      SELECT public.users.tokens_used, public.users.tokens_limit
        INTO v_used, v_limit
        FROM public.users WHERE id = p_user_id;
      RETURN QUERY SELECT false, COALESCE(v_used, 0), COALESCE(v_limit, 8000);
    END IF;
  ELSE
    -- Refund: clamp to 0
    UPDATE public.users
    SET tokens_used = GREATEST(0, tokens_used + p_amount)
    WHERE id = p_user_id
    RETURNING public.users.tokens_used, public.users.tokens_limit INTO v_used, v_limit;
    RETURN QUERY SELECT true, COALESCE(v_used, 0), COALESCE(v_limit, 8000);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_tokens_used(uuid, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tokens_used(uuid, bigint) TO service_role;
