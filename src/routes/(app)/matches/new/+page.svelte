<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SetScore } from '$lib/types/match';

    let { data } = $props();
    
    let selectedOpponentId = $state('');
    let matchFormat = $state('best_of_3');
    let matchDate = $state(new Date().toISOString().split('T')[0]);
    let winnerId = $state('');

    // Initialize with 3 sets to match the default 'best_of_3' format
    let sets: SetScore[] = $state([
        { set_number: 1, player1_games: 0, player2_games: 0, player1_tiebreak: null, player2_tiebreak: null },
        { set_number: 2, player1_games: 0, player2_games: 0, player1_tiebreak: null, player2_tiebreak: null },
        { set_number: 3, player1_games: 0, player2_games: 0, player1_tiebreak: null, player2_tiebreak: null }
    ]);
    
    // Update sets explicitly when the dropdown changes
    function handleFormatChange() {
        const targetSets = matchFormat === 'pro_set' ? 1 : matchFormat === 'best_of_3' ? 3 : 5;
        
        if (sets.length < targetSets) {
            // Push missing sets directly to preserve state proxy
            const newSets = Array.from({ length: targetSets - sets.length }, (_, i) => ({
                set_number: sets.length + i + 1,
                player1_games: 0, player2_games: 0, player1_tiebreak: null, player2_tiebreak: null
            }));
            sets.push(...newSets); 
        } else if (sets.length > targetSets) {
            // Splice off extra sets
            sets.splice(targetSets); 
        }
    }

    $effect(() => {
        // Adjust default visible sets based on format
        const targetSets = matchFormat === 'pro_set' ? 1 : matchFormat === 'best_of_3' ? 3 : 5;
        if (sets.length < targetSets) {
            sets = [...sets, ...Array.from({ length: targetSets - sets.length }, (_, i) => ({
                set_number: sets.length + i + 1,
                player1_games: 0, player2_games: 0, player1_tiebreak: null, player2_tiebreak: null
            }))];
        } else if (sets.length > targetSets) {
            sets = sets.slice(0, targetSets);
        }
    });
</script>

<div class="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="border-b border-gray-100 pb-6 mb-6">
        <h1 class="text-3xl font-extrabold text-gray-900">Report Match Result</h1>
        <p class="mt-2 text-sm text-gray-600">Submit a score for verification. Your opponent will need to confirm the result.</p>
    </div>

    <form method="POST" use:enhance class="space-y-8">
        <!-- Hidden input to pass the structured JSON payload cleanly to the server -->
        <input type="hidden" name="score_json" value={JSON.stringify(sets)} />
        
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Opponent Selection -->
            <div>
                <label for="opponent_id" class="block text-sm font-medium text-gray-700">Opponent</label>
                <select id="opponent_id" name="opponent_id" bind:value={selectedOpponentId} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border">
                    <option value="" disabled>Select an opponent...</option>
                    {#each data.profiles as profile}
                        <option value={profile.id}>{profile.username} (NTRP: {profile.ntrp_rating})</option>
                    {/each}
                </select>
            </div>

            <!-- Date Selection -->
            <div>
                <label for="match_time" class="block text-sm font-medium text-gray-700">Match Date</label>
                <input type="date" id="match_time" name="match_time" bind:value={matchDate} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" />
            </div>

            <!-- Format Selection -->
            <div>
                <label for="match_format" class="block text-sm font-medium text-gray-700">Format</label>
                <select 
                    id="match_format" 
                    name="match_format" 
                    bind:value={matchFormat} 
                    onchange={handleFormatChange}
                    required 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                >
                    <option value="best_of_3">Best of 3 Sets</option>
                    <option value="best_of_5">Best of 5 Sets</option>
                    <option value="pro_set">Pro Set (8 Games)</option>
                </select>
            </div>

            <!-- Winner Selection -->
            <div>
                <label for="winner_id" class="block text-sm font-medium text-gray-700">Winner</label>
                <select id="winner_id" name="winner_id" bind:value={winnerId} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border">
                    <option value="" disabled>Select winner...</option>
                    <option value={data.session?.user?.id}>Me</option>
                    {#if selectedOpponentId}
                        <option value={selectedOpponentId}>Opponent</option>
                    {/if}
                </select>
            </div>
        </div>

        <!-- Score Input Grid -->
        <div class="mt-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Set Scores</h3>
            <div class="space-y-4 border rounded-lg p-4 bg-gray-50">
                <div class="grid grid-cols-5 gap-4 mb-2 text-sm font-semibold text-gray-700 text-center">
                    <div class="col-span-1">Set</div>
                    <div class="col-span-2">My Score</div>
                    <div class="col-span-2">Opponent Score</div>
                </div>
                
                {#each sets as set, i}
                    <div class="grid grid-cols-5 gap-4 items-center bg-white p-3 rounded shadow-sm border border-gray-200">
                        <div class="col-span-1 font-medium text-center text-gray-700">Set {i + 1}</div>
                        
                        <!-- Player 1 (Me) -->
                        <div class="col-span-2 flex justify-center gap-2">
                            <input type="number" min="0" max="10" bind:value={sets[i].player1_games} class="w-16 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border text-center" placeholder="Games"/>
                            
                            {#if sets[i].player1_games >= 6 && sets[i].player2_games >= 6}
                                <input type="number" min="0" bind:value={sets[i].player1_tiebreak} class="w-16 rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border text-center" placeholder="TB"/>
                            {/if}
                        </div>
                
                        <!-- Player 2 (Opponent) -->
                        <div class="col-span-2 flex justify-center gap-2">
                            <input type="number" min="0" max="10" bind:value={sets[i].player2_games} class="w-16 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border text-center" placeholder="Games"/>
                            
                            {#if sets[i].player1_games >= 6 && sets[i].player2_games >= 6}
                                <input type="number" min="0" bind:value={sets[i].player2_tiebreak} class="w-16 rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border text-center" placeholder="TB"/>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="flex justify-end pt-5">
            <button type="submit" class="inline-flex justify-center rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                Submit Result for Verification
            </button>
        </div>
    </form>
</div>
