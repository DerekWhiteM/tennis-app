import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  create: async ({ request, locals: { supabase, safeGetSession } }) => {
    const session = await safeGetSession();

    const formData = await request.formData();
    
    // Existing fields
    const proposed_time = formData.get('proposed_time');
    const radius_meters = formData.get('radius_meters');
    const match_format = formData.get('match_format');
    const longitude = formData.get('longitude');
    const latitude = formData.get('latitude');

    // New preferences
    const target_gender = formData.get('target_gender')?.toString() || 'any';
    const min_ntrp = parseFloat(formData.get('min_ntrp')?.toString() || '1.0');
    const max_ntrp = parseFloat(formData.get('max_ntrp')?.toString() || '7.0');

    // Basic validation
    if (!proposed_time || !longitude || !latitude) {
      return fail(400, { error: 'Missing required fields or invalid location.' });
    }

    if (min_ntrp > max_ntrp) {
      return fail(400, { error: 'Minimum NTRP rating cannot be higher than Maximum NTRP rating.' });
    }

    const pointWKT = `POINT(${longitude} ${latitude})`;

    const { error } = await supabase
      .from('match_proposals')
      .insert({
        creator_id: session.user.id,
        proposed_time: new Date(proposed_time.toString()).toISOString(),
        radius_meters: parseInt(radius_meters?.toString() || '8050', 10),
        match_format: match_format?.toString(),
        location: pointWKT,
        target_gender,
        min_ntrp,
        max_ntrp
      });

    if (error) {
      console.error('Error creating proposal:', error);
      return fail(500, { error: 'Failed to create match proposal.' });
    }

    throw redirect(303, '/schedule');
  }
};