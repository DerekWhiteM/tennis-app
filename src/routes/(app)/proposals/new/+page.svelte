<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import type {
        Map as LeafletMap,
        Marker,
        Circle,
        DivIcon as LeafletDivIcon,
    } from "leaflet";

    // Svelte 5 Runes for reactive state
    let lat = $state(35.5859);
    let lng = $state(-80.814);
    let radiusMiles = $state(5); // Default to 10 miles

    // Derived state for the database (1 mile ≈ 1609.34 meters)
    let radiusMeters = $derived(Math.round(radiusMiles * 1609.34));

    let mapElement: HTMLElement;
    let map: LeafletMap;
    let marker: Marker;
    let radiusCircle: Circle;
    let customPinIcon: LeafletDivIcon;

    onMount(async () => {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");

        // Create a custom SVG pin icon with emerald styling via Tailwind
        // We create a DivIcon that contains our SVG markup.
        customPinIcon = L.divIcon({
            html: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="fill-emerald-600 stroke-emerald-700 w-10 h-10 drop-shadow-md">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `,
            className: "bg-transparent", // Added this just to ensure no weird default borders appear
            iconSize: [40, 40], // 40x40 perfectly matches Tailwind's w-10 h-10
            iconAnchor: [20, 40], // Anchors the bottom-middle of the pin to the precise coordinate
        });

        // Initialize map
        map = L.map(mapElement).setView([lat, lng], 11); // Zoomed out to see the radius

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // Add draggable marker with our custom emerald icon
        marker = L.marker([lat, lng], {
            draggable: true,
            icon: customPinIcon,
        }).addTo(map);

        // Add the visual radius circle (emerald tinted)
        radiusCircle = L.circle([lat, lng], {
            color: "#10b981", // Tailwind emerald-500
            fillColor: "#10b981",
            fillOpacity: 0.15,
            weight: 2,
            radius: radiusMeters,
        }).addTo(map);

        // Update coordinates when marker is dragged
        marker.on("dragend", () => {
            const position = marker.getLatLng();
            lat = position.lat;
            lng = position.lng;
        });

        // Move marker and update coordinates when map is clicked
        map.on("click", (e) => {
            lat = e.latlng.lat;
            lng = e.latlng.lng;
            marker.setLatLng([lat, lng]);
        });
    });

    // Reactively update the Leaflet circle when inputs change
    $effect(() => {
        // 1. Read dependencies first so Svelte 5 tracks them
        const currentLat = lat;
        const currentLng = lng;
        const currentRadius = radiusMeters;

        // 2. Execute the Leaflet updates only if the map objects are ready
        if (radiusCircle && marker) {
            radiusCircle.setLatLng([currentLat, currentLng]);
            radiusCircle.setRadius(currentRadius);
        }
    });
</script>

<div class="min-h-screen bg-gray-50 p-8">
    <div
        class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8"
    >
        <div class="border-b border-gray-100 pb-6 mb-6">
            <h1 class="text-3xl font-extrabold text-gray-900">
                Post a Match Proposal
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
                <div class="flex justify-between items-end mb-2">
                    <label class="block text-sm font-medium text-gray-700"
                        >Match Location</label
                    >
                    <span class="text-sm font-semibold text-emerald-600"
                        >{radiusMiles} mile radius</span
                    >
                </div>
                <p class="text-xs text-gray-500 mb-2">
                    Drag the pin or click on the map to set the exact location.
                </p>

                <!-- The map binds to this div -->
                <div
                    bind:this={mapElement}
                    class="h-80 w-full rounded-md border border-gray-300 shadow-sm z-0 relative mb-4"
                ></div>

                <!-- Hidden inputs for coordinates -->
                <input type="hidden" name="latitude" value={lat} />
                <input type="hidden" name="longitude" value={lng} />
                <input
                    type="hidden"
                    name="radius_meters"
                    value={radiusMeters}
                />

                <!-- Radius Slider -->
                <div class="px-2">
                    <input
                        type="range"
                        id="radiusMiles"
                        min="0"
                        max="10"
                        step="1"
                        bind:value={radiusMiles}
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div
                        class="flex justify-between text-xs text-gray-400 mt-1"
                    >
                        <span>0 mi</span>
                        <span>10 mi</span>
                    </div>
                </div>
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
                    href="/dashboard"
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
