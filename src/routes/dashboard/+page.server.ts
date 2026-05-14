import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session, user } = await safeGetSession();

    // Route Protection: Kick unauthenticated users back to login
    if (!user) {
        throw redirect(303, "/login");
    }

    // Pass the user data down to the Svelte component
    return {
        user,
    };
};

export const actions = {
    logout: async ({ locals: { supabase } }) => {
        // Tell Supabase to invalidate the session
        await supabase.auth.signOut();

        // Send them back to the login page
        throw redirect(303, "/login");
    },
} satisfies Actions;
