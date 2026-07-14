// src/routes/(app)/schedule/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const session = await safeGetSession();

  if (!session) {
    throw redirect(303, '/login');
  }

  const userId = session.user.id;

  // Fetch scheduled matches where the user is either player 1 or player 2
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      match_time,
      match_format,
      status,
      player1:profiles!matches_player1_id_fkey(id, username, ntrp_rating),
      player2:profiles!matches_player2_id_fkey(id, username, ntrp_rating)
    `)
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .eq('status', 'scheduled')
    .order('match_time', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    return { matches: [] };
  }

  return {
    matches: matches ?? [],
    userId
  };
};

export const actions = {
  logout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut();
    throw redirect(303, '/login');
  }
};
