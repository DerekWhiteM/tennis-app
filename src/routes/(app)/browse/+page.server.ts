import type { PageServerLoad } from "../browse/$types";
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
    // Parse UI parameters from URL query strings
    const lon = parseFloat(url.searchParams.get("lon") || "-80.8431");
    const lat = parseFloat(url.searchParams.get("lat") || "35.2271");
    const radius = parseInt(url.searchParams.get("radius") || "16093");
    const gender = url.searchParams.get("gender") || "all";
    const minNtrp = parseFloat(url.searchParams.get("minNtrp") || "1.0");
    const maxNtrp = parseFloat(url.searchParams.get("maxNtrp") || "7.0");
    const startDate = url.searchParams.get("startDate") || null;
    const endDate = url.searchParams.get("endDate") || null;

    // 1. Get the currently logged-in user to evaluate against proposal constraints
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let searcherGender = "any";
    let searcherNtrp = 0.0;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("gender, ntrp_rating")
            .eq("id", user.id)
            .single();

        if (profile) {
            searcherGender = profile.gender || "any";
            searcherNtrp = profile.ntrp_rating || 0.0;
        }
    }

    // 2. Call our custom PostGIS RPC function
    const { data: proposals, error } = await supabase.rpc(
        "browse_match_proposals",
        {
            user_lon: lon,
            user_lat: lat,
            search_radius_meters: radius,
            filter_gender: gender,
            filter_min_ntrp: minNtrp,
            filter_max_ntrp: maxNtrp,
            filter_start_date: startDate,
            filter_end_date: endDate,
            searcher_gender: searcherGender, // Injected for reverse-validation
            searcher_ntrp: searcherNtrp, // Injected for reverse-validation
        },
    );

    if (error) {
        console.error("Error fetching proposals:", error);
        return {
            proposals: [],
            filters: {
                lon,
                lat,
                radius,
                gender,
                minNtrp,
                maxNtrp,
                startDate,
                endDate,
            },
        };
    }

    return {
        proposals,
        filters: {
            lon,
            lat,
            radius,
            gender,
            minNtrp,
            maxNtrp,
            startDate,
            endDate,
        },
    };
};

export const actions = {
    accept: async ({ request, locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();
        
        if (!session?.user) {
            redirect(303, '/login');
        }

        const formData = await request.formData();
        const proposalId = formData.get('proposal_id')?.toString();

        if (!proposalId) {
            return fail(400, { error: 'Proposal ID is required' });
        }

        // 1. Fetch the proposal to ensure it is valid and open
        const { data: proposal, error: fetchError } = await supabase
            .from('match_proposals')
            .select('*')
            .eq('id', proposalId)
            .single();

        if (fetchError || !proposal) {
            return fail(404, { error: 'Proposal not found.' });
        }

        if (proposal.status !== 'open') {
            return fail(400, { error: 'This proposal is no longer available.' });
        }

        if (proposal.creator_id === session.user.id) {
            return fail(400, { error: 'You cannot accept your own proposal.' });
        }

        // 2. Mark proposal as accepted (Optimistic concurrency check included)
        const { error: updateError } = await supabase
            .from('match_proposals')
            .update({ status: 'accepted' })
            .eq('id', proposalId)
            .eq('status', 'open');

        if (updateError) {
            return fail(500, { error: 'Failed to accept the proposal. Someone else may have accepted it.' });
        }

        // 3. Create the Match record
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert({
                player1_id: proposal.creator_id,
                player2_id: session.user.id,
                match_time: proposal.proposed_time,
                match_format: proposal.match_format,
                status: 'scheduled'
            })
            .select('id')
            .single();

        if (matchError || !match) {
            return fail(500, { error: 'Failed to generate match record.' });
        }

        // 4. Create the conversation Thread
        const { data: thread, error: threadError } = await supabase
            .from('threads')
            .insert({
                match_id: match.id
            })
            .select('id')
            .single();

        if (threadError || !thread) {
            return fail(500, { error: 'Failed to create message thread.' });
        }

        // 5. Add both players to the Thread Participants
        const { error: participantsError } = await supabase
            .from('thread_participants')
            .insert([
                { thread_id: thread.id, profile_id: proposal.creator_id },
                { thread_id: thread.id, profile_id: session.user.id }
            ]);

        if (participantsError) {
            return fail(500, { error: 'Failed to add users to the message thread.' });
        }

        // 6. Redirect the user directly into their new messaging thread
        redirect(303, `/messages/${thread.id}`);
    }
};