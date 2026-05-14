import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} from "$env/static/public";

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Initialize the Supabase client
    event.locals.supabase = createServerClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll: () => event.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        event.cookies.set(name, value, {
                            ...options,
                            path: "/",
                        });
                    });
                },
            },
        },
    );

    // 2. Create a secure session getter
    // We use getUser() instead of getSession() to cryptographically verify the token on the server
    event.locals.safeGetSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession();
        if (!session) {
            return { session: null, user: null };
        }

        const {
            data: { user },
            error,
        } = await event.locals.supabase.auth.getUser();
        if (error) {
            return { session: null, user: null };
        }

        return { session, user };
    };

    // 3. Attach the session and user to locals for easy access in load functions
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            // Supabase requires these headers to be passed through
            return (
                name === "content-range" || name === "x-supabase-api-version"
            );
        },
    });
};
