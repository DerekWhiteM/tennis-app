<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SetScore } from '$lib/types/match';

    let { data } = $props();
    let match = $derived(data.match);
    let userId = $derived(data.userId);

    // Determine roles for UI display
    let isPlayer1 = $derived(match.player1_id === userId);
    let myProfile = $derived(isPlayer1 ? match.player1 : match.player2);
    let opponentProfile = $derived(isPlayer1 ? match.player2 : match.player1);
    
    // Determine who reported it and if action is required
    let isReporter = $derived(match.reporter_id === userId);
    let needsMyVerification = $derived(match.status === 'played' && !isReporter);
    let isWinner = $derived(match.winner_id === userId);

    // Score parsing
    let scores: SetScore[] = $derived(match.score_json || []);

    // Helper to format the score with tiebreaks (e.g., "7-6 (4)")
    function formatGameScore(games: number, tiebreak: number | null) {
        if (tiebreak !== null && tiebreak !== undefined) {
            return `${games} <sup class="text-xs text-gray-500">${tiebreak}</sup>`;
        }
        return games;
    }
</script>

<div class="max-w-4xl mx-auto space-y-6">
    <a href="/matches" class="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500">
        &larr; Back to Matches
    </a>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <!-- Header Section -->
        <div class="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-3xl font-extrabold text-gray-900">Match Details</h1>
                    
                    <!-- Status Badge -->
                    {#if match.status === 'verified'}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Verified</span>
                    {:else if match.status === 'played'}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Pending Verification</span>
                    {:else if match.status === 'disputed'}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Disputed</span>
                    {/if}
                </div>
                
                <p class="text-sm text-gray-600 flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {new Date(match.match_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    <span class="text-gray-300">|</span>
                    {match.match_format.replace(/_/g, ' ').toUpperCase()}
                </p>
            </div>
        </div>

        <!-- Scoreboard Section -->
        <div class="p-8 bg-gray-50/50">
            <div class="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-100">
                        <tr>
                            <th scope="col" class="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                            {#each scores as set}
                                <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                    Set {set.set_number}
                                </th>
                            {/each}
                            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Result</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        
                        <!-- My Row -->
                        <tr class={isWinner ? "bg-emerald-50/30" : ""}>
                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
                                {myProfile.username} (Me)
                                {#if isWinner}
                                    <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                {/if}
                            </td>
                            {#each scores as set}
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-900 font-medium">
                                    {@html formatGameScore(isPlayer1 ? set.player1_games : set.player2_games, isPlayer1 ? set.player1_tiebreak : set.player2_tiebreak)}
                                </td>
                            {/each}
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-center font-bold {isWinner ? 'text-emerald-600' : 'text-gray-400'}">
                                {isWinner ? 'W' : 'L'}
                            </td>
                        </tr>

                        <!-- Opponent Row -->
                        <tr class={!isWinner ? "bg-emerald-50/30" : ""}>
                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
                                {opponentProfile.username}
                                {#if !isWinner}
                                    <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                {/if}
                            </td>
                            {#each scores as set}
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-900 font-medium">
                                    {@html formatGameScore(isPlayer1 ? set.player2_games : set.player1_games, isPlayer1 ? set.player2_tiebreak : set.player1_tiebreak)}
                                </td>
                            {/each}
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-center font-bold {!isWinner ? 'text-emerald-600' : 'text-gray-400'}">
                                {!isWinner ? 'W' : 'L'}
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>

        <!-- Actions Section -->
        {#if needsMyVerification}
            <div class="p-8 border-t border-gray-100 bg-white">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Verify Match Result</h3>
                <p class="text-sm text-gray-600 mb-6">
                    {opponentProfile.username} submitted this score. Please confirm that it is accurate to finalize the match and update ratings.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4">
                    <form action="?/verify" method="POST" use:enhance>
                        <button type="submit" class="w-full sm:w-auto inline-flex justify-center rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors">
                            <svg class="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Verify & Accept Score
                        </button>
                    </form>

                    <form action="?/dispute" method="POST" use:enhance>
                        <button type="submit" class="w-full sm:w-auto inline-flex justify-center rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 transition-colors">
                            Dispute Result
                        </button>
                    </form>
                </div>
            </div>
        {:else if match.status === 'played' && isReporter}
            <div class="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3 text-sm text-gray-600">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Waiting for {opponentProfile.username} to verify this result.
            </div>
        {/if}
    </div>
</div>
