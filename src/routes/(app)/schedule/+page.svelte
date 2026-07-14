<script lang="ts">
    import { enhance } from "$app/forms";
    let { data } = $props();

    // Helper to format the timestamp into a readable date/time
    const formatMatchTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    // Helper to get the opponent's data relative to the logged-in user
    const getOpponent = (match: any) => {
        return match.player1.id === data.userId ? match.player2 : match.player1;
    };
</script>

<div>
    <!-- Dashboard Header -->
    <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 gap-4 border-b border-gray-200"
    >
        <div>
            <h1 class="text-2xl font-semibold text-gray-200">Schedule</h1>
            <p class="mt-2 text-sm text-gray-400">
                Welcome to the court, <span class="font-semibold"
                    >{data.session?.user?.email}</span
                >!
            </p>
        </div>
    </div>

    {#if data.matches.length === 0}
        <!-- Empty State -->
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
            <p class="text-lg font-medium text-gray-900">No matches scheduled</p>
            <p class="text-sm mt-1">Your upcoming tennis matches will appear here.</p>
            <a
                href="/proposals/new"
                class="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
                + Create a new match proposal
            </a>
        </div>
    {:else}
        <!-- Main Content Area: Scheduled Matches -->
        <table class="text-gray-200">
            <thead>
                <tr class="text-left">
                    <th class="pr-2">Time</th>
                    <th class="px-2">Opponent Username</th>
                    <th class="px-2">Opponent NTRP</th>
                    <th class="px-2">Format</th>
                    <th class="pl-2">Details</th>
                </tr>
            </thead>
            <tbody>
                {#each data.matches as match}
                    {@const opponent = getOpponent(match)}
                    <tr>
                        <td class="pr-2">{formatMatchTime(match.match_time)}</td>
                        <td class="px-2">{opponent.username || "Unknown Player"}</td>
                        <td class="px-2">{opponent.ntrp_rating || "N/A"}</td>
                        <td class="px-2">{match.match_format.replace(/_/g, " ").toUpperCase()}</td>
                        <td class="pl-2"
                            ><a
                                href={`/matches/${match.id}`}
                                class="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                            >
                                View Details &rarr;
                            </a></td
                        >
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
