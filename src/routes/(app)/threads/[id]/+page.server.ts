import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session?.user) {
        redirect(303, '/login');
    }

    const threadId = params.id;

    // 1. Verify user is in the thread and fetch thread context
    const { data: participantData, error: participantError } = await supabase
        .from('thread_participants')
        .select(`
            thread_id,
            threads (
                id,
                match_id,
                matches (
                    match_time,
                    match_format
                )
            )
        `)
        .eq('thread_id', threadId)
        .eq('profile_id', session.user.id)
        .single();

    if (participantError || !participantData) {
        error(404, 'Thread not found or access denied');
    }

    // safely unwrap the thread and match objects from their arrays
    const threadContext = Array.isArray(participantData.threads) 
        ? participantData.threads[0] 
        : participantData.threads;

    const matchContext = threadContext?.matches 
        ? (Array.isArray(threadContext.matches) ? threadContext.matches[0] : threadContext.matches)
        : null;

    // 2. Fetch the opponent's profile info
    const { data: opponentData } = await supabase
        .from('thread_participants')
        .select('profiles (username, ntrp_rating, elo_rating)')
        .eq('thread_id', threadId)
        .neq('profile_id', session.user.id)
        .single();

    // safely unwrap the opponent profile object
    const opponentProfile = opponentData?.profiles 
        ? (Array.isArray(opponentData.profiles) ? opponentData.profiles[0] : opponentData.profiles)
        : null;

    // 3. Fetch historical messages
    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
            id,
            content,
            created_at,
            sender_id,
            profiles (username)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

    if (messagesError) {
        error(500, 'Failed to load messages');
    }

    return {
        thread: threadContext,
        match: matchContext,
        opponent: opponentProfile,
        messages: messages || [],
        userId: session.user.id,
    };
};

export const actions = {
    send: async ({ request, params, locals: { supabase, safeGetSession } }) => {
        const { session } = await safeGetSession();
        if (!session?.user) return fail(401, { error: 'Unauthorized' });

        const formData = await request.formData();
        const content = formData.get('content')?.toString().trim();

        if (!content) {
            return fail(400, { error: 'Message cannot be empty' });
        }

        // Insert the new message
        const { error: insertError } = await supabase
            .from('messages')
            .insert({
                thread_id: params.id,
                sender_id: session.user.id,
                content
            });

        if (insertError) {
            return fail(500, { error: 'Failed to send message.' });
        }

        return { success: true };
    }
};
