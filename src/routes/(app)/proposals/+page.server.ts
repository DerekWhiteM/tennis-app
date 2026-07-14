// src/routes/(app)/proposals/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const session = await safeGetSession();

  if (!session) {
    throw redirect(303, '/login');
  }

  const userId = session.user.id;

  const { data: proposals, error } = await supabase
    .from('match_proposals')
    .select(`
      id,
      proposed_time,
      location,
      radius_meters,
      match_format,
      target_gender,
      min_ntrp,
      max_ntrp,
      status,
      created_at
    `)
    .eq('creator_id', userId);

  if (error) {
    console.error('Error fetching proposals:', error);
    return { proposals: [] };
  }

  return {
    proposals: proposals ?? [],
    userId
  };
};
