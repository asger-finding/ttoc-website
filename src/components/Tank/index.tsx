import { useRef, useEffect } from 'react'
import { TankIconSize, PlayerDetails, Colour } from '../../types';

interface LoadImageOptions {
	accessoryId?: string;
	colour?: Colour;
	size?: TankIconSize;
}

const proxyURL = 'https://ajax.tanktrouble-proxy.workers.dev/online';
const cdn = 'https://cdn.tanktrouble.com/';

const TANK_ICON_RESOLUTIONS = {
	'small': 140,
	'medium': 200,
	'large': 320
}
const TANK_ICON_CANVAS_SIZES = {
	'small': {
		width: 140,
		height: 84
	},
	'medium': {
		width: 200,
		height: 120
	},
	'large': {
		width: 320,
		height: 192
	}
}

const asyncImageLoad = (image: HTMLImageElement): Promise<HTMLImageElement> => {
	return new Promise(resolve => {
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', () => resolve(image));
	});
}

const loadImage = async(tintedBuffer: HTMLCanvasElement, path: string, options?: LoadImageOptions): Promise<HTMLImageElement> => {
	const compositeImage = new Image();

	if (options && parseInt(options.accessoryId ?? '0') === 0 && !options.colour) return compositeImage;

	compositeImage.crossOrigin = 'anonymous';
	compositeImage.src = cdn + path.replaceAll('$ID$', options?.accessoryId ?? '0');

	await asyncImageLoad(compositeImage);

	if (options?.colour) {
		const tintedContext = tintedBuffer.getContext('2d');
		if (!tintedContext) throw new Error('No tinted context');

		// Clear the tinted canvas
		tintedContext.clearRect(0, 0, tintedBuffer.width, tintedBuffer.height);

		switch (options.colour.type) {
			case 'image':
				const colourImage = new Image();
				colourImage.crossOrigin = 'anonymous';
				colourImage.src = `${cdn}assets/images/colours/colour${options.colour.imageValue}-${TANK_ICON_RESOLUTIONS[options.size ?? 'medium']}.png`;

				await asyncImageLoad(colourImage);

				tintedContext.globalCompositeOperation = 'copy';
				tintedContext.drawImage(compositeImage, 0, 0);

				tintedContext.globalCompositeOperation = 'source-in';
				tintedContext.drawImage(colourImage, 0, 0);

				compositeImage.src = tintedBuffer.toDataURL();
				return asyncImageLoad(compositeImage);
			case 'numeric':
				tintedContext.globalCompositeOperation = 'copy';
				tintedContext.fillStyle = '#' + options.colour.numericValue.replace('0x', '').padStart(6, '0');
				tintedContext.fillRect(0, 0, tintedBuffer.width, tintedBuffer.height);

				tintedContext.globalCompositeOperation = 'destination-atop';
				tintedContext.drawImage(compositeImage, 0, 0);

				compositeImage.src = tintedBuffer.toDataURL();
				return asyncImageLoad(compositeImage);
		}
	} else {
		return compositeImage;
	}
}

const drawTank = async (playerDetails: PlayerDetails, compositedBuffer: HTMLCanvasElement, size: TankIconSize) => {
	const resolution = TANK_ICON_RESOLUTIONS[size];
	const tintedBuffer = document.createElement('canvas');

	tintedBuffer.width = compositedBuffer.width = TANK_ICON_CANVAS_SIZES[size].width;
	tintedBuffer.height = compositedBuffer.height = TANK_ICON_CANVAS_SIZES[size].height;
	
	const imagePromises: Array<{
		path: string;
		options?: LoadImageOptions;
	}> = [
		// Draw back accessory
		{
			path: `assets/images/accessories/back$ID$-${resolution}.png`,
			options: { accessoryId: playerDetails.backAccessory }
		},

		// Draw the left tread
		{
			path: `assets/images/tankIcon/leftTread-${resolution}.png`,
			options: { colour: playerDetails.treadColour, size }
		},
		{ path: `assets/images/tankIcon/leftTreadShade-${resolution}.png` },

		// Draw the turret
		{
			path: `assets/images/tankIcon/turret-${resolution}.png`,
			options: { colour: playerDetails.turretColour, size }
		},
		{ path: `assets/images/tankIcon/turretShade-${resolution}.png` },

		// Draw the barrel
		{
			path: `assets/images/tankIcon/barrel-${resolution}.png`,
			options: { colour: playerDetails.turretColour, size }
		}, 
		{ path: `assets/images/tankIcon/barrelShade-${resolution}.png` },

		// Draw the base
		{
			path: `assets/images/tankIcon/base-${resolution}.png`,
			options: { colour: playerDetails.baseColour, size }
		},
		{ path: `assets/images/tankIcon/baseShade-${resolution}.png` },

		// Draw the right tread
		{
			path: `assets/images/tankIcon/rightTread-${resolution}.png`,
			options: { colour: playerDetails.treadColour, size }
		},
		{ path: `assets/images/tankIcon/rightTreadShade-${resolution}.png` },

		// Draw turret accessory
		{
			path: `assets/images/accessories/turret$ID$-${resolution}.png`,
			options: { accessoryId: playerDetails.turretAccessory }
		},

		// Draw front accessory
		{
			path: `assets/images/accessories/front$ID$-${resolution}.png`,
			options: { accessoryId: playerDetails.frontAccessory }
		},

		// Draw barrel accessory
		{
			path: `assets/images/accessories/barrel$ID$-${resolution}.png`,
			options: { accessoryId: playerDetails.barrelAccessory }
		}
	]

	const images = await Promise.all(imagePromises.map(item => loadImage(tintedBuffer, item.path, item.options)));

	const compositedContext = compositedBuffer.getContext('2d');
	if (compositedContext) for (const image of images) compositedContext.drawImage(image, 0, 0);
}

const TankCanvas = (props: { playerId: string, size: TankIconSize }) => {

	const canvasRef = useRef(null);

	useEffect(() => {
		async function draw() {
			const canvas = canvasRef.current as unknown as HTMLCanvasElement;
			const context = canvas.getContext('2d');

			if (context) {
				context.font = '48px serif';

				const result = await fetch(proxyURL, {
					body: JSON.stringify({
						method: 'tanktrouble.getPlayerDetails',
						params: [props.playerId]
					}),
					method: 'POST'
				}).then(response => response.json());

				if (result.result.result) {
					const playerDetails: PlayerDetails = result.result.data
					context.fillText(playerDetails.username, 10, 50);
					
					drawTank(playerDetails, canvas, props.size)
				}
				else context.fillText('ERROR', 10, 50);
			}
		}

		draw();
	}, [props.playerId, props.size])

	return <canvas ref={canvasRef} {...props} />
}

export default TankCanvas;
