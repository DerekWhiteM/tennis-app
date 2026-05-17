<script lang="ts">
    import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50 p-8">
    <Navbar />
    {@render children()}
</div>