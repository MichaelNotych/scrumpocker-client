<main>
	<slot/>
</main>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(:root) {
		--accent-color: #1771F1;
		--accent-color-hover: #0260E8;
	}

	:global(body) {
		font-family: Arial;
		font-size: 16px;
		line-height: 1.5;
		color: #333;
		background-color: #f9f9f9;
		margin: 0;
	}

	:global(main) {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	:global(button) {
		cursor: pointer;
		font: inherit;
		color: inherit;
	}
</style>