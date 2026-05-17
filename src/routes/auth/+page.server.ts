import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
    logout: async ({ locals: { supabase } }) => {
        // Tell Supabase to invalidate the session
        await supabase.auth.signOut();

        // Send them back to the login page
        throw redirect(303, "/login");
    },
} satisfies Actions;
