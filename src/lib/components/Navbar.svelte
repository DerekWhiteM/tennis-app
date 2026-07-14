<script lang="ts">
    import { enhance } from "$app/forms";
    const navItemClasses = "text-gray-400 hover:text-gray-200";
</script>

<div
    class="border-b border-gray-200 p-6 flex items-center justify-between"
>
    <h1 class="text-3xl font-extrabold text-gray-200">
        Rally
    </h1>
    <div class="flex items-center gap-4">
        <a
            href="/browse"
            class={navItemClasses}
        >
            Browse
        </a>
        <a
            href="/messages"
            class={navItemClasses}
        >
            Messages
        </a>
        <a
            href="/profile"
            class={navItemClasses}
        >
            Profile
        </a>
        <a
            href="/proposals"
            class={navItemClasses}
        >
            Proposals
        </a>
        <a
            href="/results"
            class={navItemClasses}
        >
            Results
        </a>
        <a
            href="/schedule"
            class={navItemClasses}
        >
            Schedule
        </a>
        <form method="POST" action="/auth?/logout" use:enhance>
            <button
                type="submit"
                class="px-4 py-2 rounded-md text-gray-200 hover:text-gray-300 bg-red-800 hover:bg-red-900"
            >
                Logout
            </button>
        </form>
    </div>
</div>
