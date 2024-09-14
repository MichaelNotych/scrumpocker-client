<script lang="ts">
	import { goto } from '$app/navigation';
	import { Copy, deleteCookie, getCookie, Quit } from '$lib';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';

	type User = {
		_id: string;
		name: string;
		room: string;
	};

	type Vote = {
		_id: string;
		userId: string;
		roomId: string;
		value: number;
	};

	type Room = {
		_id: string;
		name: string;
		number: string;
	};

	export let data;

	const room: Room = data.room;
	const currentUser: User = data.user;
	const jwt = getCookie('jwt');
	const cards = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
	let users: Array<User> = [];
	let votes: Array<Vote> = [];
	let currentUserVote: number | undefined;
	let showResults: boolean = false;
	let median: number | undefined;
	$: showResults = typeof median === 'number';

	const socket = io('http://localhost:5000', {
		query: { jwt }
	});
	onMount(() => {
		socket.emit('join', {
			roomId: room._id
		});

		socket.on('updateUserCount', ({ data }) => {
			users = [...data.users];
		});

		socket.on('updateVotes', ({ data }) => {
			votes = [...data.votes];
		});

		socket.on('showResults', ({ data }) => {
			median = data.median;
		});

		socket.on('reset', () => {
			median = undefined;
			votes = [];
		});
	});

	$: console.log('votes', votes);

	$: userWithVotes = users.map((user) => {
		const vote = votes.find((vote) => vote.userId === user._id);

		return {
			...user,
			vote: vote ? vote.value : ''
		};
	});

	$: currentUserVote = votes.find((vote) => vote.userId === currentUser._id)?.value;

	const copyHandler = () => {
		const url = `${window.location.origin}/?roomNumber=${room.number}`;
		navigator.clipboard.writeText(url);
	};

	const voteHandler = (value: number) => {
		socket.emit('vote', {
			roomId: room._id,
			userId: currentUser._id,
			voteValue: value
		});
	};

	const handleReveal = () => {
		socket.emit('showResults', {
			roomId: room._id
		});
	};

	const handleReset = () => {
		socket.emit('reset', {
			roomId: room._id
		});
	};

	const handleLeave = () => {
		socket.emit('leftRoom', {
			roomId: room._id,
			userId: currentUser._id
		});
		deleteCookie('jwt');
		socket.disconnect();
	}

	const handleQuit = () => {
		handleLeave();
		goto(`/?roomNumber=${room.number}`);
	};

	// handle tab close/reload
	window.addEventListener('beforeunload', handleLeave);
</script>

<div class="room">
	<div class="room__header">
		<h1 class="room__name">{room.name}</h1>
		<button class="room__share" on:click={copyHandler}>
			{room.number}
			<Copy width={16} height={16} />
		</button>
		<button class="room__quit" on:click={handleQuit}
			>Left room <Quit width={10} height={10} /></button
		>
	</div>
	<div class="room__wrapper">
		<div class="room__users room__users_top">
			{#each userWithVotes as user, i}
				{#if i % 2 === 1}
					<div class="room__user">
						<div
							class="room__vote"
							class:show={showResults}
							class:filled={typeof user.vote === 'number'}
						>
							{user.vote}
						</div>
						{user.name}
					</div>
				{/if}
			{/each}
		</div>
		<div class="room__table">
			{#if showResults}
				<div class="room__result">Result: {median}</div>
				<button class="room__button" on:click={handleReset}>Reset game</button>
			{:else if users.length === votes.length}
				<button class="room__button" on:click={handleReveal}>Show results</button>
			{:else if users.length === 1}
				<button class="room__button" on:click={copyHandler}
					>Copy invite link <Copy width={16} height={16} color="#fff" /></button
				>
			{:else}
				Pick your cards!
			{/if}
		</div>
		<div class="room__users room__users_bottom">
			{#each userWithVotes as user, i}
				{#if i % 2 === 0}
					<div class="room__user">
						<div
							class="room__vote"
							class:show={showResults}
							class:filled={typeof user.vote === 'number'}
						>
							{user.vote}
						</div>
						{user.name}
					</div>
				{/if}
			{/each}
		</div>
	</div>
	<div class="room__cards">
		{#each cards as card}
			<button
				class="room__card"
				class:disabled={showResults}
				class:choosed={currentUserVote === card}
				on:click={() => voteHandler(card)}>{card}</button
			>
		{/each}
	</div>
</div>

<style>
	.room {
		width: 100%;
		height: 100%;
		margin: auto;
		display: flex;
		flex-direction: column;
		padding: 4rem;
	}

	.room__header {
		display: flex;
		align-items: baseline;
	}

	.room__name {
		margin: 0 1.5rem 0 0;
	}

	.room__share {
		background-color: rgba(0, 0, 0, 0);
		border: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0;
	}

	.room__quit {
		background-color: rgba(0, 0, 0, 0);
		border: none;
		margin-left: auto;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.room__wrapper {
		margin: auto 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.room__table {
		width: 18rem;
		height: 10rem;
		background-color: #eee;
		border-radius: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 1rem;
	}

	.room__result {
		font-size: 2rem;
	}

	.room__user {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.room__vote {
		width: 4rem;
		height: 5rem;
		background-color: #f9f9f9;
		border-radius: 0.5rem;
		border: 1px solid rgba(51, 51, 51, 0.5);
		font-size: 0;
	}

	.room__vote.filled {
		position: relative;
		background-color: #fff;
	}

	.room__vote.filled::after {
		content: '👍';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		font-size: 1rem;
	}

	.room__vote.show {
		font-size: inherit;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
	}

	.room__vote.show::after {
		display: none;
	}

	.room__cards {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
		gap: 0.5rem;
	}

	.room__card {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		min-width: 4rem;
		height: 5rem;
		font-size: 1.25rem;
		border: 1px solid #eee;
		border-radius: 0.5rem;
		background-color: #fff;
		padding: 0;
		transition:
			transform 0.3s,
			border-color 0.3s;
	}

	.room__card:not(.choosed):hover {
		transform: scale(1.05);
		border-color: rgba(51, 51, 51, 0.5);
	}

	.room__card:not(.choosed):active {
		transform: scale(0.95);
	}

	.room__card.choosed {
		background-color: var(--accent-color);
		color: #fff;
	}

	.room__card.disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	.room__button {
		padding: 0.5rem 1rem;
		border: none;
		background-color: var(--accent-color);
		border-radius: 0.25rem;
		color: #fff;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background-color 0.3s;
	}

	.room__button:hover {
		background-color: var(--accent-color-hover);
	}
</style>
