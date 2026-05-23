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

<div
    class="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
>
    <!-- Dashboard Header -->
    <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6 gap-4"
    >
        <div>
            <h1 class="text-3xl font-extrabold text-gray-900">
                My Schedule
            </h1>
            <p class="mt-2 text-sm text-gray-600">
                Welcome to the court, <span
                    class="font-semibold text-emerald-700"
                    >{data.session?.user?.email}</span
                >!
            </p>
        </div>

    </div>

    <!-- Main Content Area: Scheduled Matches -->
    <h2 class="text-xl font-bold text-gray-900 mb-4">Scheduled Matches</h2>

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
            <p class="text-lg font-medium text-gray-900">
                No matches scheduled
            </p>
            <p class="text-sm mt-1">
                Your upcoming tennis matches will appear here.
            </p>
            <a
                href="/proposals/new"
                class="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
                + Create a new match proposal
            </a>
        </div>
    {:else}
        <!-- Scheduled Matches List -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {#each data.matches as match}
                {@const opponent = getOpponent(match)}

                <div
                    class="border border-gray-200 rounded-lg p-5 hover:border-emerald-300 transition-colors bg-white shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <span
                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                            >
                                {match.status.charAt(0).toUpperCase() +
                                    match.status.slice(1)}
                            </span>
                            <span
                                class="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded"
                            >
                                {match.match_format
                                    .replace(/_/g, " ")
                                    .toUpperCase()}
                            </span>
                        </div>

                        <h3 class="text-lg font-semibold text-gray-900 mt-2">
                            vs. {opponent.username || "Unknown Player"}
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            NTRP: {opponent.ntrp_rating || "N/A"}
                        </p>

                        <div
                            class="mt-4 flex items-center text-sm text-gray-600"
                        >
                            <svg
                                class="mr-1.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                            {formatMatchTime(match.match_time)}
                        </div>
                    </div>

                    <div
                        class="mt-5 pt-4 border-t border-gray-100 flex justify-end"
                    >
                        <a
                            href={`/matches/${match.id}`}
                            class="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                        >
                            View Details &rarr;
                        </a>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
