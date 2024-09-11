<script lang="ts">
	export let width: number;
	export let height: number;
	export let color: string = '';
</script>

<svg width="{width}" height="{height}" viewBox="0 0 512 512">
	<g>
		<path
			d="M479 0H92.1c-18.2 0-33 14.8-33 33s14.8 33 33 33h307.1L9.7 455.6c-12.9 12.9-12.9 33.8 0 46.7s33.8 12.9 46.7 0l389.5-389.6v307.1c0 18.2 14.8 33 33 33s33-14.8 33-33V33C512 14.8 497.2 0 479 0z"
			style="fill: {color}"
		>
		</path>
	</g>
</svg>


<style>
	svg path {
		fill: var(--accent-color);
	}
</style>