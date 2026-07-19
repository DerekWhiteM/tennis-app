<script lang="ts">
    import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen">
    <Navbar />
    <div class="p-6">
        {@render children()}
    </div>
</div>