<script lang="ts">
    let { data } = $props();

    // Derived state to categorize matches based on the new reporter_id logic
    let needsMyVerification = $derived(
        data.matches.filter(m => m.status === 'played' && m.reporter_id !== data.session?.user?.id)
    );
    
    let pendingOpponent = $derived(
        data.matches.filter(m => m.status === 'played' && m.reporter_id === data.session?.user?.id)
    );

    let verifiedHistory = $derived(
        data.matches.filter(m => m.status === 'verified')
    );

    function getOpponent(match) {
        return match.player1_id === data.session?.user?.id ? match.player2 : match.player1;
    }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900">Match Results</h1>
            <p class="mt-2 text-sm text-gray-600">Review pending scores and view your history.</p>
        </div>
        <a 
            href="/matches/new" 
            class="inline-flex justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
            + Report Score
        </a>
    </div>

    <!-- Action Required Section -->
    {#if needsMyVerification.length > 0}
        <div class="mb-10">
            <h2 class="text-xl font-bold text-red-600 flex items-center mb-4">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Action Required
            </h2>
            <div class="grid gap-4 sm:grid-cols-2">
                {#each needsMyVerification as match}
                    {@const opponent = getOpponent(match)}
                    <div class="border-2 border-red-100 bg-red-50/30 rounded-lg p-5">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-sm font-medium text-gray-900">{opponent.username} reported a score</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-4">{new Date(match.match_time).toLocaleDateString()}</p>
                        <a href={`/matches/${match.id}`} class="text-sm font-semibold text-red-600 hover:text-red-700">
                            Review & Verify &rarr;
                        </a>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- History Section -->
    <h2 class="text-xl font-bold text-gray-900 mb-4">Verified History</h2>
    
    {#if verifiedHistory.length === 0}
        <div class="py-12 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p class="text-lg font-medium text-gray-900">No verified matches yet</p>
            <p class="text-sm mt-1">Once an opponent verifies a score, it will appear here.</p>
        </div>
    {:else}
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Opponent</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Result</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    {#each verifiedHistory as match}
                        {@const opponent = getOpponent(match)}
                        {@const isWinner = match.winner_id === data.session?.user?.id}
                        <tr>
                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                                {new Date(match.match_time).toLocaleDateString()}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                                {opponent.username}
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm">
                                <span class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${isWinner ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {isWinner ? 'W' : 'L'}
                                </span>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
