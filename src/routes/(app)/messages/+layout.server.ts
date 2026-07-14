import { redirect } from '@sveltejs/kit';

export const load = async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session?.user) {
        redirect(303, '/login');
    }

    const userId = session.user.id;

    // Fetch all threads the current user is a part of
    const { data: myParticipants } = await supabase
        .from('thread_participants')
        .select(`
            thread_id,
            threads (
                id,
                matches ( match_time ),
                thread_participants (
                    profiles ( id, username, ntrp_rating )
                )
            )
        `)
        .eq('profile_id', userId);
    

    // Format the nested data into a clean array for the sidebar
    const sidebarThreads = myParticipants?.map(p => {
        // Safely unwrap Supabase arrays
        const thread = Array.isArray(p.threads) ? p.threads[0] : p.threads;
        const match = thread?.matches 
            ? (Array.isArray(thread.matches) ? thread.matches[0] : thread.matches) 
            : null;
        
        const participants = Array.isArray(thread?.thread_participants) 
            ? thread.thread_participants 
            : [thread?.thread_participants].filter(Boolean);

        // Find the opponent (the participant who is NOT the current user)
        const opponentParticipant = participants.find(part => 
            part.profiles && (Array.isArray(part.profiles) ? part.profiles[0].id : part.profiles.id) !== userId
        );
        
        const opponentProfile = opponentParticipant?.profiles
            ? (Array.isArray(opponentParticipant.profiles) ? opponentParticipant.profiles[0] : opponentParticipant.profiles)
            : null;

        return {
            id: thread?.id,
            match_time: match?.match_time,
            opponent: opponentProfile
        };
    }).filter(t => t.id) || []; // filter out any broken records

    return {
        sidebarThreads,
        userId
    };
};
