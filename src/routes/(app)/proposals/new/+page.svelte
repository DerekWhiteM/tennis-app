<script lang="ts">
    import LocationPicker from "$lib/components/LocationPicker.svelte";
    import { enhance } from "$app/forms";

    // Svelte 5 Runes for reactive state
    let lat = $state(35.5859);
    let lng = $state(-80.814);
    let radiusMiles = $state(5); // Default to 10 miles

    // Derived state for the database (1 mile ≈ 1609.34 meters)
    let radiusMeters = $derived(Math.round(radiusMiles * 1609.34));
</script>

<div class="bg-gray-50">
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
        <div class="border-b border-gray-100 pb-6 mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
                New Match Proposal
            </h1>
            <p class="mt-2 text-sm text-gray-600">
                Set your terms, drop a pin, and find an opponent.
            </p>
        </div>

        <form method="POST" action="?/create" use:enhance class="space-y-6">
            <!-- Date & Time -->
            <div>
                <label
                    for="proposed_time"
                    class="block text-sm font-medium text-gray-700"
                    >Date & Time</label
                >
                <input
                    type="datetime-local"
                    id="proposed_time"
                    name="proposed_time"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
            </div>

            <!-- Map Container -->
            <div>
                <label class="mb-2 block text-sm font-medium text-gray-700"
                    >Match Location</label
                >
                <p class="text-xs text-gray-500 mb-2">
                    Drag the pin or click on the map to set the exact location.
                </p>

                <!-- Location Picker -->
                <div class="mb-4">
                    <LocationPicker bind:lat bind:lng bind:radiusMiles />
                </div>

                <!-- Hidden inputs for coordinates -->
                <input type="hidden" name="latitude" value={lat} />
                <input type="hidden" name="longitude" value={lng} />
                <input
                    type="hidden"
                    name="radius_meters"
                    value={radiusMeters}
                />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <!-- Match Format -->
                <div class="sm:col-span-2">
                    <label
                        for="match_format"
                        class="block text-sm font-medium text-gray-700"
                        >Match Format</label
                    >
                    <select
                        id="match_format"
                        name="match_format"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    >
                        <option value="best_of_3">Best of 3 Sets</option>
                        <option value="best_of_5">Best of 5 Sets</option>
                        <option value="pro_set">Pro Set (First to 8)</option>
                    </select>
                </div>
            </div>

            <div class="border-t border-gray-100 pt-6 mt-2">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">
                    Opponent Preferences
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <!-- Target Gender -->
                    <div>
                        <label
                            for="target_gender"
                            class="block text-sm font-medium text-gray-700"
                            >Gender</label
                        >
                        <select
                            id="target_gender"
                            name="target_gender"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                            <option value="any">Any</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <!-- Min NTRP -->
                    <div>
                        <label
                            for="min_ntrp"
                            class="block text-sm font-medium text-gray-700"
                            >Min NTRP</label
                        >
                        <select
                            id="min_ntrp"
                            name="min_ntrp"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                            <!-- Incrementing from 1.0 to 7.0 -->
                            <option value="1.0">1.0</option>
                            <option value="1.5">1.5</option>
                            <option value="2.0">2.0</option>
                            <option value="2.5">2.5</option>
                            <option value="3.0">3.0</option>
                            <option value="3.5" selected>3.5</option>
                            <option value="4.0">4.0</option>
                            <option value="4.5">4.5</option>
                            <option value="5.0">5.0</option>
                            <option value="5.5">5.5</option>
                            <option value="6.0">6.0</option>
                            <option value="6.5">6.5</option>
                            <option value="7.0">7.0</option>
                        </select>
                    </div>

                    <!-- Max NTRP -->
                    <div>
                        <label
                            for="max_ntrp"
                            class="block text-sm font-medium text-gray-700"
                            >Max NTRP</label
                        >
                        <select
                            id="max_ntrp"
                            name="max_ntrp"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                            <option value="1.0">1.0</option>
                            <option value="1.5">1.5</option>
                            <option value="2.0">2.0</option>
                            <option value="2.5">2.5</option>
                            <option value="3.0">3.0</option>
                            <option value="3.5">3.5</option>
                            <option value="4.0" selected>4.0</option>
                            <option value="4.5">4.5</option>
                            <option value="5.0">5.0</option>
                            <option value="5.5">5.5</option>
                            <option value="6.0">6.0</option>
                            <option value="6.5">6.5</option>
                            <option value="7.0">7.0</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="pt-4 flex justify-end">
                <a
                    href="/schedule"
                    class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                    Cancel
                </a>
                <button
                    type="submit"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                >
                    Post Proposal
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    :global(.leaflet-container) {
        z-index: 1 !important;
    }
</style>
