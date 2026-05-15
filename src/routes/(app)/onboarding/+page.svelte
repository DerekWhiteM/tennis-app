<!-- src/routes/(app)/onboarding/+page.svelte -->
<script lang="ts">
    import { enhance } from "$app/forms";
    let { form } = $props();
</script>

<div
    class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
>
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete your player profile
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
            Let's get your stats dialed in so we can find your perfect match.
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
            class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200"
        >
            <form class="space-y-6" method="POST" use:enhance>
                {#if form?.error}
                    <div
                        class="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200"
                    >
                        {form.error}
                    </div>
                {/if}

                <div>
                    <label
                        for="ntrp_rating"
                        class="block text-sm font-medium text-gray-700"
                    >
                        NTRP Rating (1.0 - 7.0)
                    </label>
                    <div class="mt-1">
                        <select
                            id="ntrp_rating"
                            name="ntrp_rating"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        >
                            <option value="" disabled selected
                                >Select your rating...</option
                            >
                            <option value="2.5">2.5 - Beginner</option>
                            <option value="3.0">3.0 - Advanced Beginner</option>
                            <option value="3.5">3.5 - Intermediate</option>
                            <option value="4.0"
                                >4.0 - Advanced Intermediate</option
                            >
                            <option value="4.5">4.5 - Advanced</option>
                            <option value="5.0">5.0 - Expert</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label
                        for="gender"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Gender
                    </label>
                    <div class="mt-1">
                        <select
                            id="gender"
                            name="gender"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        >
                            <option value="" disabled selected>Select...</option
                            >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say"
                                >Prefer not to say</option
                            >
                        </select>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                        Save Profile & Enter Dashboard
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
