<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from "./$types";

    // Svelte 5 syntax for receiving props
    let { form }: { form: ActionData } = $props();
</script>

<div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
>
    <div
        class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200"
    >
        <div>
            <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
                Join the Court
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Log in to find your next match or create a new player profile.
            </p>
        </div>

        <!-- Alert Messages -->
        {#if form?.error}
            <div class="rounded-md bg-red-50 p-4 border border-red-200">
                <p class="text-sm text-red-700">{form.error}</p>
            </div>
        {/if}

        {#if form?.success}
            <div class="rounded-md bg-emerald-50 p-4 border border-emerald-200">
                <p class="text-sm text-emerald-700">{form.message}</p>
            </div>
        {/if}

        <!-- Auth Form -->
        <form class="mt-8 space-y-6" method="POST" use:enhance>
            <div class="space-y-4">
                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Email address
                    </label>
                    <div class="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            value={form?.email ?? ""}
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                            placeholder="player@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <div class="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            <div class="flex gap-4 pt-2">
                <!-- Primary Action -->
                <button
                    formaction="?/login"
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                    Log In
                </button>
                <!-- Secondary Action -->
                <button
                    formaction="?/signup"
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                    Sign Up
                </button>
            </div>
        </form>
    </div>
</div>
