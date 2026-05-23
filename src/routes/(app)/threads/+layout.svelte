<script lang="ts">
    import { page } from "$app/stores";

    // In Svelte 5, children is passed in as a snippet via props
    let { data, children } = $props();
</script>

<div
    class="bg-white flex rounded-xl shadow-sm border border-gray-200 overflow-hidden"
>
    <!-- LEFT SIDEBAR -->
    <div
        class="w-full sm:w-1/3 md:w-80 border-r border-gray-200 flex flex-col flex-shrink-0"
    >
        <div class="p-4 border-b border-gray-200 bg-white">
            <h2 class="text-lg font-bold text-gray-900">Messages</h2>
        </div>

        <div class="flex-1 overflow-y-auto">
            {#if data.sidebarThreads.length === 0}
                <div class="p-6 text-center text-sm text-gray-500">
                    No conversations yet.
                </div>
            {:else}
                <ul class="divide-y divide-gray-100">
                    {#each data.sidebarThreads as thread (thread.id)}
                        {@const isActive = $page.url.pathname.includes(
                            thread.id,
                        )}
                        <li>
                            <a
                                href={`/threads/${thread.id}`}
                                class="block p-4 transition-colors hover:bg-gray-100 {isActive
                                    ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                    : 'border-l-4 border-transparent'}"
                            >
                                <div
                                    class="flex justify-between items-start mb-1"
                                >
                                    <span
                                        class="font-medium text-gray-900 truncate"
                                    >
                                        {thread.opponent?.username ||
                                            "Unknown Player"}
                                    </span>
                                    <span
                                        class="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-200 text-gray-700"
                                    >
                                        {thread.opponent?.ntrp_rating || "N/A"}
                                    </span>
                                </div>
                                {#if thread.match_time}
                                    <div
                                        class="text-xs text-gray-500 flex items-center gap-1"
                                    >
                                        <span>📅</span>
                                        {new Date(
                                            thread.match_time,
                                        ).toLocaleDateString([], {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                {/if}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>

    <!-- RIGHT CONTENT AREA -->
    <div class="hidden sm:flex flex-1 flex-col bg-white relative">
        {@render children()}
    </div>
</div>
