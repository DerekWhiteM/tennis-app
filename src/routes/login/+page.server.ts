import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
    login: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return fail(400, {
                error: "Please enter both email and password.",
                email,
            });
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return fail(400, { error: error.message, email });
        }

        // Redirect the player to the matchmaking dashboard upon success
        throw redirect(303, "/schedule");
    },

    signup: async ({ request, url, locals: { supabase } }) => {
        const formData = await request.formData();
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return fail(400, {
                error: "Please enter both email and password.",
                email,
            });
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // This tells the email link exactly where to send the user back to
                emailRedirectTo: `${url.origin}/auth/callback`,
            },
        });

        if (error) {
            return fail(400, { error: error.message, email });
        }

        return {
            success: true,
            message:
                "Check your email for a confirmation link to activate your account.",
        };
    },
} satisfies Actions;
