<script>
  export let title;
  export let date;
  export let description;
</script>

<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
  <header class="mb-10">
    <h1 class="text-4xl font-bold text-surface-fg mb-4">{title}</h1>
    {#if description}
      <p class="text-xl text-surface-fg mb-3">{description}</p>
    {/if}
    {#if date}
      <time
        datetime={date}
        class="text-sm font-medium text-muted tracking-wide uppercase"
      >
        {new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
    {/if}
  </header>

  <div class="prose prose-lg prose-invert max-w-none prose-headings:text-surface-fg prose-strong:text-surface-fg prose-code:text-surface-fg prose-blockquote:text-muted">
    <slot />
  </div>
</article>