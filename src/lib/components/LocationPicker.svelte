<script lang="ts">
	import { onMount } from "svelte";
	import type { Map as LeafletMap, Marker, Circle } from "leaflet";

	let {
		lat = $bindable(35.2271),
		lng = $bindable(-80.8431),
		radiusMiles = $bindable(10),
		locationName = $bindable("Charlotte, NC")
	} = $props();

	let radiusMeters = $derived(Math.round(radiusMiles * 1609.34));

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let marker: Marker;
	let radiusCircle: Circle;
	
	let searchQuery = $state("");
	let isSearching = $state(false);
	let isLocating = $state(false);

	// 1. FORWARD Geocoding: Text -> Coordinates
	async function searchLocation(e: Event) {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		
		isSearching = true;
		try {
			const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
			const data = await res.json();
			
			if (data && data.length > 0) {
				lat = parseFloat(data[0].lat);
				lng = parseFloat(data[0].lon);
				
				const parts = data[0].display_name.split(',');
				locationName = parts.length > 1 ? `${parts[0].trim()}, ${parts[1].trim()}` : parts[0].trim();
				searchQuery = ""; 
			} else {
				alert("Location not found. Try a city, zip code, or neighborhood.");
			}
		} catch (err) {
			console.error("Geocoding error:", err);
		} finally {
			isSearching = false;
		}
	}

	// 2. REVERSE Geocoding: Coordinates -> Text String
	async function reverseGeocode(targetLat: number, targetLng: number) {
		locationName = "Finding location name...";
		try {
			// Note: Nominatim requires a user-agent or limits requests to 1 per second. 
			// Since this only fires on click/drag-end, we stay well within free limits.
			const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}`);
			const data = await res.json();
			
			if (data && data.address) {
				// Try to construct a clean "City, State" format
				const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county;
				const state = data.address.state;
				
				if (city && state) {
					locationName = `${city}, ${state}`;
				} else {
					// Fallback if city/state formatting is weird
					locationName = data.name || "Custom Map Pin";
				}
			} else {
				locationName = "Custom Map Pin";
			}
		} catch (err) {
			console.error("Reverse geocoding error:", err);
			locationName = "Custom Map Pin";
		}
	}

	function requestLocation() {
		isLocating = true;
		navigator.geolocation.getCurrentPosition(
			(position) => {
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				isLocating = false;
				
				// Automatically reverse-geocode their current location!
				reverseGeocode(lat, lng);
			},
			(err) => {
				console.error(err);
				isLocating = false;
				alert('Could not acquire geographic position.');
			}
		);
	}

	onMount(async () => {
		const L = await import("leaflet");
		await import("leaflet/dist/leaflet.css");

		const customPinIcon = L.divIcon({
			html: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="fill-emerald-600 stroke-emerald-700 w-10 h-10 drop-shadow-md">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `,
			className: "bg-transparent",
			iconSize: [40, 40],
			iconAnchor: [20, 40],
		});

		map = L.map(mapElement).setView([lat, lng], 10);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "&copy; OpenStreetMap contributors",
		}).addTo(map);

		marker = L.marker([lat, lng], {
			draggable: true,
			icon: customPinIcon,
		}).addTo(map);

		radiusCircle = L.circle([lat, lng], {
			color: "#10b981",
			fillColor: "#10b981",
			fillOpacity: 0.15,
			weight: 2,
			radius: radiusMeters,
		}).addTo(map);

		// Handle Pin Drag
		marker.on("dragend", () => {
			const position = marker.getLatLng();
			lat = position.lat;
			lng = position.lng;
			reverseGeocode(lat, lng); // Trigger text update
		});

		// Handle Map Click
		map.on("click", (e) => {
			lat = e.latlng.lat;
			lng = e.latlng.lng;
			marker.setLatLng([lat, lng]);
			reverseGeocode(lat, lng); // Trigger text update
		});
	});

	$effect(() => {
		const currentLat = lat;
		const currentLng = lng;
		const currentRadius = radiusMeters;

		if (radiusCircle && marker && map) {
			radiusCircle.setLatLng([currentLat, currentLng]);
			radiusCircle.setRadius(currentRadius);
			marker.setLatLng([currentLat, currentLng]);
			map.setView([currentLat, currentLng], map.getZoom(), { animate: true });
		}
	});
</script>

<div class="space-y-4">
	<form onsubmit={searchLocation} class="flex gap-2">
		<div class="relative flex-1">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
			</svg>
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Search city, neighborhood, or zip..." 
				class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm"
			/>
		</div>
		<button 
			type="submit" 
			disabled={isSearching}
			class="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
		>
			{isSearching ? '...' : 'Search'}
		</button>
		<button 
			type="button" 
			onclick={requestLocation}
			disabled={isLocating}
			class="p-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
			title="Use current location"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
			</svg>
		</button>
	</form>

	<div
		bind:this={mapElement}
		class="h-64 w-full rounded-md border border-gray-200 shadow-inner z-0 relative"
	></div>

	<div>
		<div class="flex justify-between items-center mb-1">
			<label for="radiusMiles" class="text-sm font-medium text-gray-700">Search Radius</label>
			<span class="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{radiusMiles} miles</span>
		</div>
		<input 
			type="range" min="1" max="100" step="1" 
			id="radiusMiles"
			bind:value={radiusMiles} 
			class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
		/>
	</div>
</div>

<style>
	:global(.leaflet-container) {
		z-index: 1 !important;
	}
</style>