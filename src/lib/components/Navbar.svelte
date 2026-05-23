<script lang="ts">
    import { enhance } from "$app/forms";
</script>

<div
    class="bg-white shadow-sm border rounded-xl border-gray-200 p-6 mb-8 flex items-center justify-between"
>
    <h1 class="text-3xl font-extrabold text-gray-900">Rally</h1>
    <div class="flex items-center gap-4">
        <a
            href="/dashboard"
            class="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
            Schedule
        </a>
        <a
            href="/proposals"
            class="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
            Proposals
        </a>
        <a
            href="/threads"
            class="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
            Threads
        </a>
        <a
            href="/profile"
            class="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
            Profile
        </a>

        <!-- Logout Form -->
        <form method="POST" action="/auth?/logout" use:enhance>
            <button
                type="submit"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
                Log Out
            </button>
        </form>
    </div>
</div>
