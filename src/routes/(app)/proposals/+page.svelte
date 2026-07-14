<script lang="ts">
    // list user's proposals
    let { data } = $props();
</script>

<div>
    <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 gap-4 border-b border-gray-200"
    >
        <div>
            <h1 class="text-2xl font-semibold text-gray-200">My Proposals</h1>
        </div>
    </div>
    {#if data.proposals.length === 0}
        <div
            class="py-12 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50"
        >
            <svg
                class="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
            </svg>
            <p class="text-lg font-medium text-gray-900">No current match proposals</p>
            <p class="text-sm mt-1">Your created proposals will appear here.</p>
            <a
                href="/proposals/new"
                class="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
                + Create a new match proposal
            </a>
        </div>
    {:else}
        <table class="text-gray-200">
            <thead>
                <tr class="text-left">
                    <th class="pr-2">Time</th>
                    <th class="px-2">Format</th>
                    <th class="px-2">Min NTRP</th>
                    <th class="px-2">Max NTRP</th>
                    <th class="pl-2">Gender</th>
                </tr>
            </thead>
            <tbody>
                {#each data.proposals as proposal}
                    <tr>
                        <td class="pr-2">{proposal.proposed_time}</td>
                        <td class="px-2"
                            >{proposal.match_format.replace(/_/g, " ").toUpperCase()}</td
                        >
                        <td class="px-2">{proposal.min_ntrp}</td>
                        <td class="px-2">{proposal.max_ntrp}</td>
                        <td class="pl-2">{proposal.target_gender}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
