import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
    // Note: Use safeGetSession or getSession depending on your specific auth setup
    const { session } = await safeGetSession();
    
    if (!session) {
        throw redirect(303, '/login');
    }

    const userId = session.user.id;

    // Fetch matches where the current user is one of the players
    const { data: matches, error } = await supabase
        .from('matches')
        .select(`
            id,
            match_time,
            match_format,
            status,
            reporter_id,
            winner_id,
            player1_id,
            player2_id,
            player1:profiles!player1_id(id, username, ntrp_rating),
            player2:profiles!player2_id(id, username, ntrp_rating)
        `)
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order('match_time', { ascending: false });

    if (error) {
        console.error('Error fetching matches:', error);
        // Return an empty array so your .filter() methods don't crash
        return { matches: [] }; 
    }

    return {
        matches: matches || []
    };
};
