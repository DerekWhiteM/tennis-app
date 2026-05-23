import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) throw redirect(303, '/login');

    // For the opponent dropdown, fetch all profiles except the current user
    // (In production, you might restrict this to recent chat threads or friends)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, ntrp_rating')
        .neq('id', session.user.id)
        .order('username');

    return { 
        profiles: profiles || []
    };
};

export const actions: Actions = {
    default: async ({ request, locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();
        if (!session) return fail(401, { error: 'Unauthorized' });

        const formData = await request.formData();
        const opponent_id = formData.get('opponent_id') as string;
        const match_time = formData.get('match_time') as string;
        const match_format = formData.get('match_format') as string;
        const winner_id = formData.get('winner_id') as string;
        
        // Parse the stringified JSON payload from the hidden input
        const score_json_string = formData.get('score_json') as string;
        let score_json;
        
        try {
            // Filter out unplayed sets (where both scores are 0) before inserting
            const parsedScores = JSON.parse(score_json_string);
            score_json = parsedScores.filter((s: any) => s.player1_games > 0 || s.player2_games > 0);
        } catch (e) {
            return fail(400, { error: 'Invalid score format' });
        }

        if (!opponent_id || !winner_id || score_json.length === 0) {
            return fail(400, { error: 'Missing required fields or scores' });
        }

        // Insert the ad-hoc match record
        const { error } = await supabase
            .from('matches')
            .insert({
                player1_id: session.user.id, // Current user is always p1 in ad-hoc
                player2_id: opponent_id,
                match_time: new Date(match_time).toISOString(),
                match_format,
                score_json,
                winner_id,
                reporter_id: session.user.id,
                status: 'played' // Skips 'scheduled' and goes straight to requiring verification
            });

        if (error) {
            console.error('Insert error:', error);
            return fail(500, { error: 'Failed to submit match result' });
        }

        throw redirect(303, '/matches');
    }
};
