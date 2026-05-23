<script lang="ts">
    import { enhance } from "$app/forms";
    import { tick } from "svelte";

    let { data, form } = $props();

    let chatContainer: HTMLElement;
    let isSending = $state(false);
    let inputValue = $state("");

    // Auto-scroll to bottom whenever data.messages changes
    $effect(() => {
        if (data.messages && chatContainer) {
            tick().then(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        }
    });
</script>

<div
    class="flex flex-col overflow-hidden"
>
    <!-- Header: Opponent & Match Context -->
    <div
        class="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
        <div class="flex items-center gap-4">
            <h1 class="text-lg font-bold text-gray-900">
                {data.opponent?.username || "Unknown Player"}
            </h1>
            <div class="flex gap-2 mt-1">
                <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                >
                    NTRP {data.opponent?.ntrp_rating || "N/A"}
                </span>
                <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100"
                >
                    📈 {data.opponent?.elo_rating || 1000} Elo
                </span>
            </div>
        </div>

        {#if data.match}
            <div
                class="text-sm text-gray-600 flex items-center gap-2"
            >
                <span>📅</span>
                <span class="font-medium">
                    {new Date(data.match.match_time).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
                <span class="mx-1 text-gray-300">|</span>
                <span class="capitalize"
                    >{data.match.match_format.replace(/_/g, " ")}</span
                >
            </div>
        {/if}
    </div>

    <!-- Error Alert -->
    {#if form?.error}
        <div
            class="bg-red-50 border-b border-red-100 text-red-700 px-6 py-2 text-sm"
        >
            {form.error}
        </div>
    {/if}

    <!-- Message List -->
    <div
        bind:this={chatContainer}
        class="flex-1 overflow-y-auto p-6 space-y-6"
    >
        {#if data.messages.length === 0}
            <div
                class="h-full flex flex-col items-center justify-center text-gray-500"
            >
                <p class="text-sm">
                    No messages yet. Say hello to finalize the match details!
                </p>
            </div>
        {:else}
            {#each data.messages as msg (msg.id)}
                {@const isMe = msg.sender_id === data.userId}
                <div class="flex flex-col {isMe ? 'items-end' : 'items-start'}">
                    <div
                        class="max-w-[75%] px-4 py-2.5 rounded-2xl {isMe
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-none'}"
                    >
                        <p class="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span class="text-[11px] text-gray-400 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            {/each}
        {/if}
    </div>

    <!-- Message Input Form -->
    <div class="bg-white border-t border-gray-200 p-4">
        <form
            method="POST"
            action="?/send"
            class="flex gap-3"
            use:enhance={() => {
                isSending = true;
                // Optimistically clear the input
                const tempVal = inputValue;
                inputValue = "";

                return async ({ update, result }) => {
                    isSending = false;
                    if (result.type !== "success") {
                        // Restore input if it failed
                        inputValue = tempVal;
                    }
                    await update(); // This automatically refetches data.messages
                };
            }}
        >
            <input
                type="text"
                name="content"
                bind:value={inputValue}
                placeholder="Type a message..."
                class="flex-1 rounded-full border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-gray-50"
                disabled={isSending}
                autocomplete="off"
            />
            <button
                aria-label="Send Message"
                type="submit"
                disabled={isSending || inputValue.trim() === ""}
                class="inline-flex items-center justify-center rounded-full bg-emerald-600 p-2.5 text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                </svg>
            </button>
        </form>
    </div>
</div>
