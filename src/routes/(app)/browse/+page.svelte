<script lang="ts">
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
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

    let isAcceptModalOpen = $state(false);
    let selectedProposal = $state<any>(null);

    function openAcceptModal(prop: any) {
        selectedProposal = prop;
        isAcceptModalOpen = true;
    }

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

    const labelClasses = "text-gray-200 mb-2";
    const inputClasses =
        "w-full bg-gray-950 rounded-md border-gray-400 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm text-gray-400 hover:text-gray-200";
    const tableHeaderClasses =
        "p-6 text-left text-xs font-semibold uppercase tracking-wide text-gray-400";
</script>

{#if isAcceptModalOpen && selectedProposal}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div
                class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"
            >
                <h2 class="text-lg font-bold text-gray-900">Confirm Match</h2>
                <button
                    onclick={() => (isAcceptModalOpen = false)}
                    class="text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1.5 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
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
                <p class="text-gray-600">
                    Are you sure you want to accept this match with <span
                        class="font-bold text-gray-900"
                        >{selectedProposal.creator_username || "Anonymous Player"}</span
                    >?
                </p>
                <div
                    class="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700 space-y-1 border border-gray-100"
                >
                    <p>
                        <span class="font-semibold text-gray-900">Time:</span>
                        {new Date(selectedProposal.proposed_time).toLocaleString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                    <p>
                        <span class="font-semibold text-gray-900">Format:</span>
                        <span class="capitalize"
                            >{selectedProposal.match_format.replace(/_/g, " ")}</span
                        >
                    </p>
                    <p>
                        <span class="font-semibold text-gray-900">NTRP:</span>
                        {selectedProposal.creator_ntrp || "N/A"}
                    </p>
                </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button
                    onclick={() => (isAcceptModalOpen = false)}
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <form
                    method="POST"
                    action="?/accept"
                    use:enhance={() => {
                        return async ({ update }) => {
                            isAcceptModalOpen = false;
                            await update();
                        };
                    }}
                >
                    <input type="hidden" name="proposal_id" value={selectedProposal.id} />
                    <button
                        type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        Confirm Acceptance
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}

{#if isModalOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div
                class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"
            >
                <h2 class="text-lg font-bold text-gray-900">Change location</h2>
                <button
                    onclick={() => (isModalOpen = false)}
                    class="text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1.5 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
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
                <LocationPicker bind:lat bind:lng bind:radiusMiles bind:locationName />
            </div>

            <div class="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
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
    class="pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100"
>
    <div>
        <h1 class="text-2xl font-semibold text-gray-200">Browse</h1>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-12 items-start">
    <form
        onsubmit={handleSearch}
        class="border-r border-gray-100 pr-6 mb-6 lg:col-span-3 lg:sticky lg:top-6"
    >
        <div class="my-6">
            <div class={labelClasses}>Location</div>
            <button
                type="button"
                onclick={() => (isModalOpen = true)}
                class="w-full rounded-md border border-gray-400 bg-gray-950 px-3 py-2 text-left text-sm text-gray-400 shadow-sm transition-colors hover:text-gray-200"
            >
                {locationName} · Within {radiusMiles} mi
            </button>
        </div>

        <div class="my-6">
            <div class={labelClasses}>Date Range</div>
            <div class="space-y-3">
                <div>
                    <label for="startDate" class="sr-only">Start Date</label>
                    <input type="date" id="startDate" bind:value={startDate} class={inputClasses} />
                </div>
                <div>
                    <label for="endDate" class="sr-only">End Date</label>
                    <input type="date" id="endDate" bind:value={endDate} class={inputClasses} />
                </div>
            </div>
        </div>

        <div class="my-6">
            <div class={labelClasses}>Gender</div>
            <select id="gender" bind:value={gender} class={inputClasses}>
                <option value="all">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </div>

        <div class="grid grid-cols-2 gap-3 my-6">
            <div>
                <div class={labelClasses}>Min NTRP</div>
                <select id="minNtrp" bind:value={minNtrp} class={inputClasses}>
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
                <div class={labelClasses}>Max NTRP</div>
                <select id="maxNtrp" bind:value={maxNtrp} class={inputClasses}>
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
            class="w-full bg-green-800 text-gray-200 hover:bg-green-900 hover:text-gray-300 rounded-md py-2"
        >
            Search
        </button>
    </form>

    <div class="lg:col-span-9 space-y-4">
        {#if data.proposals.length === 0}
            <div class="py-12 flex flex-col items-center justify-between">
                <p class="text-xl font-bold text-gray-200">No proposals found</p>
                <p class="text-sm text-center mt-2 max-w-md text-gray-400">
                    We couldn't find any proposals matching your criteria. Please adjust your criteria or <a href="/proposals/new" class="underline hover:text-gray-200">create a new proposal</a>.
                </p>
            </div>
        {:else}
            <div class="overflow-hidden border-gray-200 shadow-sm">
                <table class="w-full divide-y divide-gray-200">
                    <thead class="">
                        <tr>
                            <th class={tableHeaderClasses}> Player </th>
                            <th class={tableHeaderClasses}> Match Time </th>
                            <th class={tableHeaderClasses}> Format </th>
                            <th class={tableHeaderClasses}> Distance </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        {#each data.proposals as prop (prop.id)}
                            <tr
                                class="hover:bg-green-900 transition-colors"
                                onclick={() => openAcceptModal(prop)}
                            >
                                <td class="p-6 whitespace-nowrap">
                                    <div class="text-sm font-semibold text-gray-200 truncate">
                                        {prop.creator_username || "Anonymous Player"}
                                    </div>
                                    <div class="text-xs text-gray-400 mt-1">
                                        NTRP {prop.creator_ntrp || "N/A"} · {prop.creator_elo} Elo
                                    </div>
                                </td>
                                <td class="p-6 whitespace-nowrap text-sm text-gray-200">
                                    {new Date(prop.proposed_time).toLocaleString([], {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td class="p-6 whitespace-nowrap text-sm text-gray-200 capitalize">
                                    {prop.match_format.replace(/_/g, " ")}
                                </td>
                                <td class="p-6 whitespace-nowrap text-sm text-gray-200">
                                    {(prop.distance_meters / 1609.34).toFixed(1)} mi
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>
