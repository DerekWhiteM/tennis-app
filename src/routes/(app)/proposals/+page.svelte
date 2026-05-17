<script lang="ts">
    import { goto } from "$app/navigation";
    import LocationPicker from "$lib/components/LocationPicker.svelte";

    let { data } = $props();

    let radiusMiles = $state(Math.round(data.filters.radius / 1609.34) || 5);
    let gender = $state(data.filters.gender);
    let minNtrp = $state(data.filters.minNtrp);
    let maxNtrp = $state(data.filters.maxNtrp);
    let lng = $state(data.filters.lon);
    let lat = $state(data.filters.lat);

    // New states for the date range filter (defaulting to whatever is passed from the server or empty)
    let startDate = $state(data.filters.startDate || "");
    let endDate = $state(data.filters.endDate || "");

    // Modal state
    let locationName = $state("Charlotte, NC");
    let isModalOpen = $state(false);

    function handleSearch(e?: Event) {
        if (e) e.preventDefault();
        const radiusMeters = Math.round(radiusMiles * 1609.34);

        const searchParams = new URLSearchParams();
        searchParams.set("lon", lng.toString());
        searchParams.set("lat", lat.toString());
        searchParams.set("radius", radiusMeters.toString());
        searchParams.set("gender", gender);
        searchParams.set("minNtrp", minNtrp.toString());
        searchParams.set("maxNtrp", maxNtrp.toString());

        // Append dates if the user filled them out
        if (startDate) searchParams.set("startDate", startDate);
        if (endDate) searchParams.set("endDate", endDate);

        goto(`?${searchParams.toString()}`, {
            replaceState: false,
            keepFocus: true,
        });
    }

    function applyLocation() {
        isModalOpen = false;
        handleSearch();
    }
</script>

{#if isModalOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <div
            class="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        >
            <div
                class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"
            >
                <h2 class="text-lg font-bold text-gray-900">Change location</h2>
                <button
                    onclick={() => (isModalOpen = false)}
                    class="text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1.5 transition-colors"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path></svg
                    >
                </button>
            </div>

            <div class="p-6">
                <LocationPicker
                    bind:lat
                    bind:lng
                    bind:radiusMiles
                    bind:locationName
                />
            </div>

            <div
                class="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50"
            >
                <button
                    onclick={applyLocation}
                    class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
                >
                    Apply Search Area
                </button>
            </div>
        </div>
    </div>
{/if}

<div
    class="max-w-7xl mx-auto space-y-8 bg-white rounded-xl shadow-sm border border-gray-200"
>
    <div
        class="pb-6 m-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100"
    >
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Find Matches</h1>
            <p class="text-sm text-gray-500 mt-1">
                Discover available players looking for a match within your
                range.
            </p>
        </div>
        <div class="flex flex-wrap gap-3 w-full sm:w-auto">
            <a
                href="/proposals/mine"
                class="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
            >
                My Proposals
            </a>
            <a
                href="/proposals/new"
                class="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
            >
                <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                    ></path></svg
                >
                Post Match
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
            onsubmit={handleSearch}
            class="border-r border-gray-100 px-6 mb-6 space-y-6 lg:col-span-3 lg:sticky lg:top-6"
        >
            <div>
                <h2 class="text-md text-gray-900 mb-2">Location</h2>
                <button
                    type="button"
                    onclick={() => (isModalOpen = true)}
                    class="text-left text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 hover:underline w-full"
                >
                    {locationName} · Within {radiusMiles} mi
                </button>
            </div>

            <hr class="border-gray-100" />

            <div>
                <h3 class="text-sm font-medium text-gray-900 mb-2">
                    Date Range
                </h3>
                <div class="space-y-3">
                    <div>
                        <label for="startDate" class="sr-only">Start Date</label
                        >
                        <input
                            type="date"
                            id="startDate"
                            bind:value={startDate}
                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm text-gray-600"
                        />
                    </div>
                    <div>
                        <label for="endDate" class="sr-only">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            bind:value={endDate}
                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm text-gray-600"
                        />
                    </div>
                </div>
            </div>

            <hr class="border-gray-100" />

            <div>
                <label
                    for="gender"
                    class="block text-sm font-medium text-gray-900 mb-1"
                    >Gender</label
                >
                <select
                    id="gender"
                    bind:value={gender}
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                >
                    <option value="all">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label
                        for="minNtrp"
                        class="block text-sm font-medium text-gray-900 mb-1"
                        >Min NTRP</label
                    >
                    <select
                        id="minNtrp"
                        bind:value={minNtrp}
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    >
                        <option value="1.0">1.0</option>
                        <option value="1.5">1.5</option>
                        <option value="2.0">2.0</option>
                        <option value="2.5">2.5</option>
                        <option value="3.0">3.0</option>
                        <option value="3.5">3.5</option>
                        <option value="4.0">4.0</option>
                        <option value="4.5">4.5</option>
                        <option value="5.0">5.0</option>
                        <option value="5.5">5.5</option>
                        <option value="6.0">6.0</option>
                        <option value="6.5">6.5</option>
                        <option value="7.0">7.0</option>
                    </select>
                </div>
                <div>
                    <label
                        for="maxNtrp"
                        class="block text-sm font-medium text-gray-900 mb-1"
                        >Max NTRP</label
                    >
                    <select
                        id="maxNtrp"
                        bind:value={maxNtrp}
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    >
                        <option value="1.0">1.0</option>
                        <option value="1.5">1.5</option>
                        <option value="2.0">2.0</option>
                        <option value="2.5">2.5</option>
                        <option value="3.0">3.0</option>
                        <option value="3.5">3.5</option>
                        <option value="4.0">4.0</option>
                        <option value="4.5">4.5</option>
                        <option value="5.0">5.0</option>
                        <option value="5.5">5.5</option>
                        <option value="6.0">6.0</option>
                        <option value="6.5">6.5</option>
                        <option value="7.0">7.0</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                class="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
                Filter Results
            </button>
        </form>

        <div class="lg:col-span-9 space-y-4 mr-6">
            {#if data.proposals.length === 0}
                <div
                    class="py-12 flex flex-col items-center justify-between  text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50"
                >
                    <div class="bg-gray-50 p-4 rounded-full mb-4">
                        <svg
                            class="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                        </svg>
                    </div>
                    <p class="text-xl font-bold text-gray-900">
                        No match proposals found
                    </p>
                    <p class="text-sm mt-2 max-w-md text-gray-500">
                        We couldn't find any proposals matching your criteria.
                        Try expanding your search radius, moving the map pin, or
                        widening your NTRP preferences.
                    </p>
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {#each data.proposals as prop (prop.id)}
                        <div
                            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all"
                        >
                            <div>
                                <div
                                    class="flex justify-between items-start mb-3"
                                >
                                    <div>
                                        <h3
                                            class="font-bold text-gray-900 text-lg truncate pr-2"
                                            title={prop.creator_username ||
                                                "Anonymous Player"}
                                        >
                                            {prop.creator_username ||
                                                "Anonymous Player"}
                                        </h3>
                                        <div class="flex gap-2 mt-1">
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                                            >
                                                NTRP {prop.creator_ntrp ||
                                                    "N/A"}
                                            </span>
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100"
                                            >
                                                📈 {prop.creator_elo} Elo
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap"
                                    >
                                        {(
                                            prop.distance_meters / 1609.34
                                        ).toFixed(1)} mi
                                    </span>
                                </div>

                                <hr class="border-gray-100 my-4" />

                                <div class="space-y-2.5 text-sm text-gray-600">
                                    <p class="flex items-center gap-2">
                                        <span class="text-gray-400">📅</span>
                                        <span class="font-medium text-gray-900">
                                            {new Date(
                                                prop.proposed_time,
                                            ).toLocaleString([], {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="text-gray-400">🎾</span>
                                        Format:
                                        <span
                                            class="capitalize font-medium text-gray-900"
                                            >{prop.match_format.replace(
                                                /_/g,
                                                " ",
                                            )}</span
                                        >
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="text-gray-400">🎯</span>
                                        Seeking:
                                        <span class="font-medium text-gray-900"
                                            >NTRP {prop.min_ntrp} - {prop.max_ntrp}
                                            ({prop.target_gender})</span
                                        >
                                    </p>
                                </div>
                            </div>

                            <div class="mt-6">
                                <button
                                    class="w-full text-center bg-gray-900 hover:bg-emerald-600 text-white font-medium text-sm py-2 px-4 rounded-md transition-colors shadow-sm"
                                    onclick={() =>
                                        alert(
                                            "Accepting proposal... Route next!",
                                        )}
                                >
                                    Accept Proposal
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
