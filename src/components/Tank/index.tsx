import {
	useRef,
	useEffect
} from 'react'
import {
	PLAYER_DETAILS_COLOUR_TYPES,
	TANK_ICON_SIZES,
	TANK_ICON_RESOLUTIONS,
	TANK_ICON_CANVAS_SIZES,
	TANK_ICON_IMAGE_TYPES,
	PlayerDetails,
	DrawTankPlayerDetails,
	LoadImageOptions,
	fallbackDrawPlayerDetails
} from '../../constants';

const proxyURL = 'https://ajax.tanktrouble-proxy.workers.dev/online';
const cdn = 'https://cdn.tanktrouble.com/';

/**
 * Create a promise for image load or erroring.
 * 
 * @param image Target image
 * @returns A promise that resolves upon load or error
 */
const asyncImageLoad = (image: HTMLImageElement): Promise<HTMLImageElement> => {
	return new Promise(resolve => {
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', () => resolve(image));
	});
}

/**
 * Clone a canvas node and draw the image onto the clone.
 * 
 * @param targetCanvas Canvas element to clone
 * @returns Cloned canvas node
 */
const cloneCanvas = (targetCanvas: HTMLCanvasElement) => {
	// Clone the node without descendants
	const newCanvas = targetCanvas.cloneNode(false) as HTMLCanvasElement;
	const context = newCanvas.getContext('2d');

	// Draw the image from the old canvas to the cloned one
	context?.drawImage(targetCanvas, 0, 0);
	return newCanvas;
}

/**
 * Take in the parameters and return a promise for the image load. If specified, tint the image.
 * 
 * @param tintedBuffer Tint buffer for colour tinting
 * @param path Path to the image to be loaded
 * @param options Image type and optional data
 * @returns 
 */
const loadImage = async (tintedBuffer: HTMLCanvasElement, path: string, options: LoadImageOptions): Promise<HTMLImageElement | HTMLCanvasElement> => {
	const compositeImage = new Image(tintedBuffer.width, tintedBuffer.height);

	// If the accessory id is 0, assume that nothing is equipped.
	if (options.type === TANK_ICON_IMAGE_TYPES.Accessory && options.accessoryId === '0') return compositeImage;

	compositeImage.crossOrigin = 'anonymous';
	compositeImage.src = cdn + path.replaceAll('$ID$', options.accessoryId ?? '0');

	await asyncImageLoad(compositeImage);

	if (options.type === TANK_ICON_IMAGE_TYPES.Paint && options.colour) {
		const tintedContext = tintedBuffer.getContext('2d');
		if (!tintedContext) throw new Error('No tinted context');

		switch (options.colour.type) {
			case PLAYER_DETAILS_COLOUR_TYPES.Numeric:
				// Fill the canvas with the numeric colour value
				tintedContext.globalCompositeOperation = 'copy';
				tintedContext.fillStyle = '#' + options.colour.numericValue.replace('0x', '').padStart(6, '0');
				tintedContext.fillRect(0, 0, tintedBuffer.width, tintedBuffer.height);

				// Cut out the shape from the filled canvas
				tintedContext.globalCompositeOperation = 'destination-atop';
				tintedContext.drawImage(compositeImage, 0, 0);

				return cloneCanvas(tintedBuffer);

			case PLAYER_DETAILS_COLOUR_TYPES.Image:
				const colourImage = new Image(tintedBuffer.width, tintedBuffer.height);
				colourImage.crossOrigin = 'anonymous';
				colourImage.src = `${cdn}assets/images/colours/colour${options.colour.imageValue}-${TANK_ICON_RESOLUTIONS[options.size ?? TANK_ICON_SIZES.Medium]}.png`;

				await asyncImageLoad(colourImage);

				// Clear the canvas and draw the shape upon the canvas
				tintedContext.globalCompositeOperation = 'copy';
				tintedContext.drawImage(compositeImage, 0, 0);

				// Draw the image only onto where the canvas is filled
				tintedContext.globalCompositeOperation = 'source-in';
				tintedContext.drawImage(colourImage, 0, 0);

				return cloneCanvas(tintedBuffer);
		}
	} else {
		return compositeImage;
	}
}

/**
 * Render a tank upon the given canvas using image from TankTrouble.
 * 
 * @param playerDetails Relevant player details
 * @param compositeBuffer The canvas element to draw upon
 * @param size The tank canvas size
 */
const drawTank = async (playerDetails: DrawTankPlayerDetails, compositeBuffer: HTMLCanvasElement, size: TANK_ICON_SIZES, shouldBeOutlined: boolean) => {
	const resolution = TANK_ICON_RESOLUTIONS[size];
	compositeBuffer.width = TANK_ICON_CANVAS_SIZES[size].width;
	compositeBuffer.height = TANK_ICON_CANVAS_SIZES[size].height;

	const tintedBuffer = compositeBuffer.cloneNode(false) as HTMLCanvasElement;

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

	// Load all images in async
	const loadedImages = await Promise.all(imagePromises.map(item => loadImage(tintedBuffer, item.path, item.options)));

	// Draw the images onto the canvas context in order
	const compositeContext = compositeBuffer.getContext('2d');
	if (!compositeContext) throw new Error('No composite context');

	for (const image of loadedImages) compositeContext.drawImage(image, 0, 0);

	if (shouldBeOutlined) {
		// Clone the composite buffer and get its context
		const outlineBuffer = cloneCanvas(compositeBuffer);
		const outlineContext = outlineBuffer.getContext('2d');
		if (!outlineContext) throw new Error('No outline context');

		// Darken the cloned content
		outlineContext.globalCompositeOperation = 'source-in';
        outlineContext.fillStyle = 'rgba(0,0,0, 0.8)';
        outlineContext.fillRect(0, 0, compositeBuffer.width, compositeBuffer.height);

		const outlineWidth = devicePixelRatio / 2;
        const outlineDiagWidth = Math.sqrt((outlineWidth ** 2) / 2.0);

		compositeContext.globalCompositeOperation = 'destination-over';

		// Shift the outline and draw it eight times to the composite
        compositeContext.drawImage(outlineBuffer, -outlineWidth, 0);
        compositeContext.drawImage(outlineBuffer, -outlineDiagWidth, -outlineDiagWidth);
        compositeContext.drawImage(outlineBuffer, -outlineDiagWidth, outlineDiagWidth);
        compositeContext.drawImage(outlineBuffer, 0, outlineWidth);
        compositeContext.drawImage(outlineBuffer, 0, -outlineWidth);
        compositeContext.drawImage(outlineBuffer, outlineDiagWidth, -outlineDiagWidth);
        compositeContext.drawImage(outlineBuffer, outlineDiagWidth, outlineDiagWidth);
        compositeContext.drawImage(outlineBuffer, outlineWidth, 0);
	}
}

/**
 * Render a TankTrouble tank as a canvas.
 * 
 * @param props React properties
 * @param props.playerId The target player id
 * @param props.size The intended size
 * @returns Active canvas that's being drawn.
 */
export default function TankCanvas(props: { playerId: string; size: TANK_ICON_SIZES; outline: 'true' | 'false'; }) {
	const canvasRef = useRef(null);
	const interpretedOutline = props.outline === 'true';

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

					drawTank(playerDetails, canvas, props.size, interpretedOutline)
				} else {
					drawTank(fallbackDrawPlayerDetails, canvas, props.size, interpretedOutline);
				}
			}
		}

		draw();
	}, [props.playerId, props.size, interpretedOutline]);

	return <canvas ref={canvasRef} />
}
