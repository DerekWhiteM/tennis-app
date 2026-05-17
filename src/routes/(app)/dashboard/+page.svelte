<script lang="ts">
    
    import type { PageData } from "./$types";

    // Svelte 5 syntax to receive the data from +page.server.ts
    let { data }: { data: PageData } = $props();
</script>

<div class="bg-gray-50">
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
        <!-- Dashboard Header -->
        <div class="border-b border-gray-100 pb-6 mb-6 gap-4">
            <h1 class="text-2xl font-bold text-gray-900">Match Schedule</h1>
        </div>

        <!-- Main Content Area -->
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
            <p class="text-sm">
                Your upcoming tennis matches and stats will appear here.
            </p>
        </div>
    </div>
</div>
