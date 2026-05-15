<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    // Import your Tailwind CSS file here so it applies globally
    import "./layout.css";

    // Destructure the children prop using Svelte 5 runes
    let { children } = $props();
</script>

<!-- Render the current page or nested layout -->
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
