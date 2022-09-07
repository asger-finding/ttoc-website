export enum COLOUR_TYPES {
	Numeric = 'numeric',
	Image = 'image'
}
export interface Colour {
	imageValue: string;
	numericValue: string;
	rawValue: string;
	type: COLOUR_TYPES;
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
export enum TANK_ICON_IMAGE_TYPES {
	Paint,
	Accessory,
	Image
}
export enum TANK_ICON_SIZES {
	SMALL,
	MEDIUM,
	LARGE
}
export const TANK_ICON_RESOLUTIONS: Record<TANK_ICON_SIZES, number> = {
	[TANK_ICON_SIZES.SMALL]: 140,
	[TANK_ICON_SIZES.MEDIUM]: 200,
	[TANK_ICON_SIZES.LARGE]: 320
}
export const TANK_ICON_CANVAS_SIZES: Record<TANK_ICON_SIZES, {
	width: number;
	height: number;
}> = {
	[TANK_ICON_SIZES.SMALL]: {
		width: 140,
		height: 84
	},
	[TANK_ICON_SIZES.MEDIUM]: {
		width: 200,
		height: 120
	},
	[TANK_ICON_SIZES.LARGE]: {
		width: 320,
		height: 192
	}
}

export interface LoadImageOptions {
	type: TANK_ICON_IMAGE_TYPES;
	accessoryId?: string;
	colour?: Colour;
	size?: TANK_ICON_SIZES;
}
export type DrawTankPlayerDetails = Partial<PlayerDetails> & Required<Pick<PlayerDetails,
	'backAccessory'
	| 'treadColour'
	| 'turretColour'
	| 'baseColour'
	| 'turretAccessory'
	| 'frontAccessory'
	| 'barrelAccessory'
>>;
