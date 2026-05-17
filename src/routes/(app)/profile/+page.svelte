<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData, ActionData } from "./$types";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    // $derived ensures this variable updates reactively when SvelteKit
    // re-fetches the load function data after a successful submission
    let profile = $derived(data.profile);
</script>

<div class="bg-gray-50">
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
        <!-- Header -->
        <div class="border-b border-gray-100 pb-6 mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
                Player Profile
            </h1>
            <p class="mt-2 text-sm text-gray-600">
                Update your on-court details and matchmaking preferences.
            </p>
        </div>

        <!-- Read-Only Stats Container -->
        <div class="flex gap-4 mb-8">
            <div
                class="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
                <p
                    class="text-xs text-gray-500 uppercase tracking-wider font-semibold"
                >
                    Elo Rating
                </p>
                <p class="text-2xl font-bold text-emerald-700">
                    {profile?.elo_rating || 1000}
                </p>
            </div>
            <div
                class="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
                <p
                    class="text-xs text-gray-500 uppercase tracking-wider font-semibold"
                >
                    Matches Played
                </p>
                <p class="text-2xl font-bold text-gray-900">
                    {profile?.matches_played || 0}
                </p>
            </div>
        </div>

        <!-- Form Status Messages -->
        {#if form?.error}
            <div
                class="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm"
            >
                {form.error}
            </div>
        {/if}

        {#if form?.success}
            <div
                class="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-sm"
            >
                Profile updated successfully!
            </div>
        {/if}

        <!-- Custom use:enhance prevents the form from clearing -->
        <form
            method="POST"
            action="?/updateProfile"
            use:enhance={() => {
                return async ({ update }) => {
                    await update({ reset: false });
                };
            }}
            class="space-y-6"
        >
            <!-- Username -->
            <div>
                <label
                    for="username"
                    class="block text-sm font-medium text-gray-700"
                    >Username</label
                >
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={profile?.username || ""}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                />
            </div>

            <!-- Gender Dropdown -->
            <div>
                <label
                    for="gender"
                    class="block text-sm font-medium text-gray-700"
                    >Gender</label
                >
                <select
                    id="gender"
                    name="gender"
                    value={profile?.gender || "prefer_not_to_say"}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border bg-white"
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
            </div>

            <!-- NTRP Rating -->
            <div>
                <label
                    for="ntrp_rating"
                    class="block text-sm font-medium text-gray-700"
                >
                    NTRP Rating (1.0 - 7.0)
                </label>
                <input
                    type="number"
                    id="ntrp_rating"
                    name="ntrp_rating"
                    step="0.5"
                    min="1.0"
                    max="7.0"
                    value={profile?.ntrp_rating || 3.0}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                />
                <p class="mt-1 text-xs text-gray-500">
                    This helps us match you with players of similar skill
                    levels.
                </p>
            </div>

            <!-- Submit Actions -->
            <div
                class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100"
            >
                <a
                    href="/dashboard"
                    class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                    Cancel
                </a>
                <button
                    type="submit"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</div>
