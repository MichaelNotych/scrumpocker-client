type Login = {
	userName: string;
	roomName?: string;
	roomNumber?: string;
	roomPassword: string;
};

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