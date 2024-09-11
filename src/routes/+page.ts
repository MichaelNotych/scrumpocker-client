import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
	// try to get room number from url
	const roomNumber: string | null = url.searchParams.get('roomNumber');

	return {
		roomNumber
	};
}