<script lang="ts">
	import { goto } from '$app/navigation';
	import { getCookie, setCookie } from '$lib';

	type Login = {
		userName: string;
		roomName?: string;
		roomNumber?: string;
		roomPassword: string;
	};

	export let data;

	let userName: string = getCookie('userName') || '';
	let roomName: string = '';
	let roomNumber: string = data.roomNumber ? data.roomNumber : '';
	let roomPassword: string = '';
	let action: 'create' | 'join' = data.roomNumber ? 'join' : 'create';
	$: isFormDataValid = userName && (roomName || roomNumber) && roomPassword;
	$: title = action === 'create' ? 'Create room' : 'Join room';

	const submitHandler = async () => {
		// create request body
		let dataToSend: Login = {
			userName,
			roomPassword
		};

		// depends on an action add additional data
		if (action === 'create') {
			dataToSend = { ...dataToSend, roomName };
		} else {
			dataToSend = { ...dataToSend, roomNumber };
		}
		try {
			const res = await fetch(`http://localhost:5000/room/${action}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(dataToSend)
			});

			// parsing server answer
			const json = await res.json();
			if (!json.success) {
				return console.error(json.error);
			}
			const { room, user, token } = json.data;

			// set auth token in cookies
			setCookie('jwt', token);
			setCookie('userName', userName);
			console.log({ room, user });
			goto(`/${room._id}`);
		} catch (error) {
			console.error(`Can't ${action} room`);
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<div class="wrapper">
	<h1>{title}</h1>
	<form class="form" on:submit|preventDefault={submitHandler}>
		<input
			class="form__input"
			type="text"
			name="username"
			placeholder="Username"
			bind:value={userName}
			autocomplete="off"
		/>
		{#if action === 'create'}
			<input
				class="form__input"
				type="text"
				name="room"
				placeholder="Room name"
				bind:value={roomName}
				autocomplete="off"
			/>
		{:else}
			<input
				class="form__input"
				type="text"
				name="roomNumber"
				placeholder="Room number"
				bind:value={roomNumber}
				autocomplete="off"
			/>
		{/if}

		<input
			class="form__input"
			type="text"
			name="password"
			placeholder="Room password"
			bind:value={roomPassword}
			autocomplete="off"
		/>
		<button class="form__button" class:disabled={!isFormDataValid}>{action}</button>
	</form>
	<p class="hint">
		{#if action === 'create'}
			Want to join existed room?
			<button class="hint__button" on:click={() => (action = 'join')}> Click here </button>
		{:else}
			Want to create new room?
			<button class="hint__button" on:click={() => (action = 'create')}> Click here </button>
		{/if}
	</p>
</div>

<style>
	.wrapper {
		max-width: 600px;
		width: 100%;
		margin: auto;
	}

	.form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form__input {
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #fff;
		border: 1px solid #eee;
		width: 100%;
		font: inherit;
		color: #333;
		outline: none;
		transition: border-color 0.3s;
	}

	.form__input:focus {
		border-color: var(--accent-color);
	}

	.form__button {
		padding: 1rem 0.5rem;
		border: none;
		background-color: var(--accent-color);
		text-transform: uppercase;
		border-radius: 0.5rem;
		color: #fff;
		transition: background-color 0.3s;
	}

	.form__button:hover {
		background-color: var(--accent-color-hover);
	}

	.form__button.disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	.hint {
		text-align: center;
	}

	.hint__button {
		background-color: rgba(0, 0, 0, 0);
		color: var(--accent-color);
		transition: color 0.3s;
		border: none;
		padding: 0;
		margin: 0 0 0 5px;
	}
</style>
