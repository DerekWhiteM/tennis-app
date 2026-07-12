<script lang="ts">
    import { enhance } from "$app/forms";
</script>

<div
    class="bg-gray-950 shadow-sm border-b border-gray-200 p-6 flex items-center justify-between"
>
    <h1 class="text-3xl font-extrabold text-gray-200">Rally</h1>
    <div class="flex items-center gap-4">
        <a
            href="/dashboard"
            class="text-sm font-medium text-gray-200 hover:text-gray-400 transition-colors"
        >
            Schedule
        </a>
        <a
            href="/proposals"
            class="text-sm font-medium text-gray-200 hover:text-gray-400 transition-colors"
        >
            Proposals
        </a>
        <a
            href="/threads"
            class="text-sm font-medium text-gray-200 hover:text-gray-400 transition-colors"
        >
            Threads
        </a>
        <a
            href="/profile"
            class="text-sm font-medium text-gray-200 hover:text-gray-400 transition-colors"
        >
            Profile
        </a>

        <!-- Logout Form -->
        <form method="POST" action="/auth?/logout" use:enhance>
            <button
                type="submit"
                class="cursor-pointer px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
                Log Out
            </button>
        </form>
    </div>
</div>
