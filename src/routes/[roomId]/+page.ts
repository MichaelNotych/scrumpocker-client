import type { PageLoad } from "./$types";
import { goto } from "$app/navigation";
import { deleteCookie, getCookie } from "$lib";

export const load: PageLoad = async ({ params, fetch }) => {
	// get room id from url
	const roomId: string = params.roomId;
	const jwt = getCookie('jwt');

	// check if user logged in
	const user = await fetch(`http://localhost:5000/user/me`, {
		headers: {
			'Authorization': `Bearer ${jwt}`
		}
	});
	const userObj = await user.json();

	if (!userObj.user) {
		deleteCookie('jwt');
		goto('/');
	}

	console.log('userObj', userObj)
	
	// check if the room exists
	const room = await fetch(`http://localhost:5000/room?roomId=${roomId}`);
	const roomObj = await room.json();

	// todo: check if current user has access to the room

	if (!room) {
		deleteCookie('jwt');
		goto('/');
	}

	return {
		room: roomObj.room,
		user: userObj.user
	};
}