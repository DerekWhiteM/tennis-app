import type { PageServerLoad } from "./$types";

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
