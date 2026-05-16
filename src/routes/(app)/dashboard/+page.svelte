<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types";

    // Svelte 5 syntax to receive the data from +page.server.ts
    let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-gray-50 p-8">
    <div
        class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8"
    >
        <!-- Dashboard Header -->
        <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6 gap-4"
        >
            <div>
                <h1 class="text-3xl font-extrabold text-gray-900">
                    Player Dashboard
                </h1>
                <p class="mt-2 text-sm text-gray-600">
                    Welcome to the court, <span
                        class="font-semibold text-emerald-700"
                        >{data.user?.email}</span
                    >!
                </p>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-4">
                <a
                    href="/proposals/new"
                    class="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                    New Proposal
                </a>
                <a
                    href="/profile"
                    class="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                    Edit Profile
                </a>

                <!-- Logout Form -->
                <form method="POST" action="?/logout" use:enhance>
                    <button
                        type="submit"
                        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                        Log Out
                    </button>
                </form>
            </div>
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
