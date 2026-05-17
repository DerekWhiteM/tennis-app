import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, gender, ntrp_rating, elo_rating, matches_played')
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        // Depending on your setup, you might want to handle this more gracefully
    }

    return { profile };
};

export const actions: Actions = {
    updateProfile: async ({ request, locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();
        if (!session) {
            redirect(303, '/login');
        }

        const formData = await request.formData();
        const username = formData.get('username') as string;
        const gender = formData.get('gender') as string;
        const ntrp_rating = parseFloat(formData.get('ntrp_rating') as string);

        // Server-side validation matching your database constraints
        if (ntrp_rating < 1.0 || ntrp_rating > 7.0) {
            return fail(400, { error: 'NTRP rating must be between 1.0 and 7.0' });
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                username,
                gender,
                ntrp_rating
            })
            .eq('id', session.user.id);

        if (error) {
            console.error('Error updating profile:', error);
            // Handle unique constraint violations (e.g., username already taken)
            if (error.code === '23505') {
                return fail(400, { error: 'That username is already taken.' });
            }
            return fail(500, { error: 'Failed to update profile. Please try again.' });
        }

        return { success: true };
    }
};