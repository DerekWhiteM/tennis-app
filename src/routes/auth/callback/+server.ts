import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
    const code = url.searchParams.get("code");
    // You can pass a 'next' parameter if you want to redirect them somewhere specific,
    // otherwise we default to the dashboard.
    const next = url.searchParams.get("next") ?? "/dashboard";

    if (code) {
        // Trade the code for a secure session!
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Success! Send them to the app.
            throw redirect(303, `/${next.slice(1)}`);
        }
    }

    // If there's no code or the exchange failed, send them back to login with an error.
    // You could also redirect to a dedicated error page.
    throw redirect(
        303,
        "/login?error=Verification failed. Please try logging in or signing up again.",
    );
};
