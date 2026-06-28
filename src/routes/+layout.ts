// src/routes/+layout.ts
import { createBrowserClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
    depends('supabase:auth')

    // Create a client-side Supabase instance.
    // The browser client automatically handles cookies now, so we only need to pass fetch!
    const supabase = createBrowserClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            global: { fetch }
        }
    )

    // Returning this here merges `supabase` into the `data` prop of every +page.svelte
    return { supabase, session: data.session }
}
