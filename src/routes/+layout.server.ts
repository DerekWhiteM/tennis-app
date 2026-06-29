// src/routes/(app)/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
    locals: { supabase, safeGetSession },
    url,
}) => {
    const { session, user } = await safeGetSession();

    // Send to /login if not logged in
    if (!session || !user) {
        if (url.pathname !== "/login") {
            throw redirect(303, "/login");
        }
        return {};
    }

    // Fetch the user's profile data
    const { data: profile } = await supabase
        .from("profiles")
        .select("ntrp_rating, gender")
        .eq("id", session.user.id)
        .single();

    // Define what makes a profile "complete"
    const needsOnboarding = !profile?.ntrp_rating || !profile?.gender;

    // Enforce the redirect, but avoid infinite loops
    if (needsOnboarding && url.pathname !== "/onboarding") {
        throw redirect(303, "/onboarding");
    }

    // If they try to go back to onboarding after completing it, send them away
    if (!needsOnboarding && url.pathname === "/onboarding") {
        throw redirect(303, "/dashboard");
    }

    return {
        user,
        profile,
        session,
    };
};
