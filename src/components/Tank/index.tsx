import {
	useRef,
	useEffect
} from 'react'
import {
	COLOUR_TYPES,
	TANK_ICON_SIZES,
	TANK_ICON_RESOLUTIONS,
	TANK_ICON_CANVAS_SIZES,
	TANK_ICON_IMAGE_TYPES,
	PlayerDetails,
	DrawTankPlayerDetails,
	LoadImageOptions,
	Colour
} from '../../constants';

const proxyURL = 'https://ajax.tanktrouble-proxy.workers.dev/online';
const cdn = 'https://cdn.tanktrouble.com/';
const TANK_UNAVAILABLE_COLOUR: Colour = {
	imageValue: '',
	numericValue: '0x888888',
	rawValue: '0x888888',
	type: COLOUR_TYPES.Numeric
}

const asyncImageLoad = (image: HTMLImageElement): Promise<HTMLImageElement> => {
	return new Promise(resolve => {
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', () => resolve(image));
	});
}

const cloneCanvas = (canvasToClone: HTMLCanvasElement) => {
	const newCanvas = canvasToClone.cloneNode(false) as HTMLCanvasElement;
	const context = newCanvas.getContext('2d');

	context?.drawImage(canvasToClone, 0, 0);
	return newCanvas;
}

const loadImage = async (tintedBuffer: HTMLCanvasElement, path: string, options: LoadImageOptions): Promise<HTMLImageElement | HTMLCanvasElement> => {
	const compositeImage = new Image(tintedBuffer.width, tintedBuffer.height);

	if (options.type === TANK_ICON_IMAGE_TYPES.Accessory && options.accessoryId === '0') return compositeImage;

	compositeImage.crossOrigin = 'anonymous';
	compositeImage.src = cdn + path.replaceAll('$ID$', options.accessoryId ?? '0');

	await asyncImageLoad(compositeImage);

	if (options.type === TANK_ICON_IMAGE_TYPES.Paint && options.colour) {
		const tintedContext = tintedBuffer.getContext('2d');
		if (!tintedContext) throw new Error('No tinted context');

		// Clear the tinted canvas
		tintedContext.clearRect(0, 0, tintedBuffer.width, tintedBuffer.height);

		switch (options.colour.type) {
			case COLOUR_TYPES.Numeric:
				tintedContext.globalCompositeOperation = 'copy';
				tintedContext.fillStyle = '#' + options.colour.numericValue.replace('0x', '').padStart(6, '0');
				tintedContext.fillRect(0, 0, tintedBuffer.width, tintedBuffer.height);

				tintedContext.globalCompositeOperation = 'destination-atop';
				tintedContext.drawImage(compositeImage, 0, 0);

				return cloneCanvas(tintedBuffer);

			case COLOUR_TYPES.Image:
				const colourImage = new Image(tintedBuffer.width, tintedBuffer.height);
				colourImage.crossOrigin = 'anonymous';
				colourImage.src = `${cdn}assets/images/colours/colour${options.colour.imageValue}-${TANK_ICON_RESOLUTIONS[options.size ?? TANK_ICON_SIZES.MEDIUM]}.png`;

				await asyncImageLoad(colourImage);

				tintedContext.globalCompositeOperation = 'copy';
				tintedContext.drawImage(compositeImage, 0, 0);

				tintedContext.globalCompositeOperation = 'source-in';
				tintedContext.drawImage(colourImage, 0, 0);

				return cloneCanvas(tintedBuffer);
		}
	} else {
		return compositeImage;
	}
}

const drawTank = async (playerDetails: DrawTankPlayerDetails, compositedBuffer: HTMLCanvasElement, size: TANK_ICON_SIZES) => {
	const resolution = TANK_ICON_RESOLUTIONS[size];
	const tintedBuffer = document.createElement('canvas');

	tintedBuffer.width = compositedBuffer.width = TANK_ICON_CANVAS_SIZES[size].width;
	tintedBuffer.height = compositedBuffer.height = TANK_ICON_CANVAS_SIZES[size].height;

	const imagePromises: Array<{ path: string; options: LoadImageOptions; }> = [
		// Draw back accessory
		{
			path: `assets/images/accessories/back$ID$-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Accessory,
				accessoryId: playerDetails.backAccessory
			}
		},

		// Draw the left tread
		{
			path: `assets/images/tankIcon/leftTread-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Paint,
				colour: playerDetails.treadColour,
				size
			}
		},
		{
			path: `assets/images/tankIcon/leftTreadShade-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Image
			}
		},

		// Draw the turret
		{
			path: `assets/images/tankIcon/turret-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Paint,
				colour: playerDetails.turretColour,
				size
			}
		},
		{
			path: `assets/images/tankIcon/turretShade-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Image
			}
		},

		// Draw the barrel
		{
			path: `assets/images/tankIcon/barrel-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Paint,
				colour: playerDetails.turretColour,
				size
			}
		},
		{
			path: `assets/images/tankIcon/barrelShade-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Image
			}
		},

		// Draw the base
		{
			path: `assets/images/tankIcon/base-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Paint,
				colour: playerDetails.baseColour,
				size
			}
		},
		{
			path: `assets/images/tankIcon/baseShade-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Image
			}
		},

		// Draw the right tread
		{
			path: `assets/images/tankIcon/rightTread-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Paint,
				colour: playerDetails.treadColour,
				size
			}
		},
		{
			path: `assets/images/tankIcon/rightTreadShade-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Image
			}
		},

		// Draw turret accessory
		{
			path: `assets/images/accessories/turret$ID$-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Accessory,
				accessoryId: playerDetails.turretAccessory
			}
		},

		// Draw front accessory
		{
			path: `assets/images/accessories/front$ID$-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Accessory,
				accessoryId: playerDetails.frontAccessory
			}
		},

		// Draw barrel accessory
		{
			path: `assets/images/accessories/barrel$ID$-${resolution}.png`,
			options: {
				type: TANK_ICON_IMAGE_TYPES.Accessory,
				accessoryId: playerDetails.barrelAccessory
			}
		}
	]

	const images = await Promise.all(imagePromises.map(item => loadImage(tintedBuffer, item.path, item.options)));

	const compositedContext = compositedBuffer.getContext('2d');
	if (compositedContext)
		for (const image of images) compositedContext.drawImage(image, 0, 0);
}

const TankCanvas = (props: { playerId: string; size: TANK_ICON_SIZES; }) => {
	const canvasRef = useRef(null);

	useEffect(() => {
		async function draw() {
			const canvas = canvasRef.current as unknown as HTMLCanvasElement;
			const context = canvas.getContext('2d');

			if (context) {
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
				} else {
					drawTank({
						barrelAccessory: '0',
						backAccessory: '0',
						frontAccessory: '0',
						treadAccessory: '0',
						turretAccessory: '0',
						baseColour: TANK_UNAVAILABLE_COLOUR,
						turretColour: TANK_UNAVAILABLE_COLOUR,
						treadColour: TANK_UNAVAILABLE_COLOUR
					}, canvas, props.size);
				}
			}
		}

		draw();
	}, [props.playerId, props.size])

	return <canvas ref={canvasRef} />
}

export default TankCanvas;
