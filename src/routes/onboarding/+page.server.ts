// src/routes/(app)/onboarding/+page.server.ts
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    default: async ({ request, locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();
        if (!session) throw redirect(303, "/login");

        const formData = await request.formData();
        const gender = formData.get("gender") as string;
        const ntrp_rating = parseFloat(formData.get("ntrp_rating") as string);

        // Basic validation
        if (!gender || isNaN(ntrp_rating)) {
            return fail(400, { error: "Please complete all fields." });
        }

        // Update the profile
        const { error } = await supabase
            .from("profiles")
            .update({ gender, ntrp_rating })
            .eq("id", session.user.id);

        if (error) {
            return fail(500, {
                error: "Failed to update profile. Please try again.",
            });
        }

        // Success! Redirect to dashboard
        throw redirect(303, "/schedule");
    },
};
