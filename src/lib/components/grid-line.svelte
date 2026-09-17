<script>
	let { class: className = '' } = $props()
</script>

<div
	class={['relative left-1/2 h-px w-screen -translate-x-1/2 bg-border', className]}
	aria-hidden="true"
></div>
