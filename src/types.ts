
export type TankIconSize = 'small' | 'medium' | 'large';
export interface Colour {
	imageValue: string;
	numericValue: string;
	rawValue: string;
	type: 'numeric' | 'image';
}
export interface PlayerDetails {
	username: string;
	playerId: string;

	kills: number;
	victories: number;
	deaths: number;
	suicides: number;
	surrenders: number;

	created: number;
	lastLogin: number;
	lastForumPost: number;

	rank: number;
	experience: number;
	xp: number;

	baseColour: Colour;
	treadColour: Colour;
	turretColour: Colour;

	turretAccessory: string;
	treadAccessory: string;
	frontAccessory: string;
	barrelAccessory: string;
	backAccessory: string;
	backgroundAccessory: string;
	badge: string;

	verified: boolean;
	usernameApproved: boolean;
	banned: boolean;
	guest: boolean;
	beta: boolean;
	newsSubscriber: boolean;
	premium: boolean;
	
	country: string;
	gmLevel: null | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}
