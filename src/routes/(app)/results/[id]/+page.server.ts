import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) throw redirect(303, '/login');

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
            id, match_time, match_format, score_json, status, winner_id, reporter_id,
            player1_id, player2_id,
            player1:profiles!player1_id(id, username, ntrp_rating),
            player2:profiles!player2_id(id, username, ntrp_rating)
        `)
        .eq('id', params.id)
        .single();

    if (matchError || !match) {
        throw error(404, 'Match not found');
    }

    // Ensure the current user is actually a participant in this match
    if (match.player1_id !== session.user.id && match.player2_id !== session.user.id) {
        throw error(403, 'You do not have permission to view this match.');
    }

    return { 
        match, 
        userId: session.user.id 
    };
};

export const actions: Actions = {
    verify: async ({ params, locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();
        if (!session) return fail(401, { error: 'Unauthorized' });

        const { error: updateError } = await supabase
            .from('matches')
            .update({ status: 'verified' })
            .eq('id', params.id)
            .eq('status', 'played') // Only allow verifying pending matches
            .neq('reporter_id', session.user.id); // Prevent reporter from verifying their own submission

        if (updateError) {
            console.error('Verify error:', updateError);
            return fail(500, { error: 'Failed to verify match' });
        }

        return { success: true };
    },

    dispute: async ({ params, locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();
        if (!session) return fail(401, { error: 'Unauthorized' });

        const { error: updateError } = await supabase
            .from('matches')
            .update({ status: 'disputed' })
            .eq('id', params.id)
            .eq('status', 'played')
            .neq('reporter_id', session.user.id);

        if (updateError) {
            console.error('Dispute error:', updateError);
            return fail(500, { error: 'Failed to dispute match' });
        }

        return { success: true };
    }
};
