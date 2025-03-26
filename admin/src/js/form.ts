// Initialisation
function initListeners(mymap: any): void {
	console.log("TODO: add more event listeners...");

	(document.getElementById("setZrrButton") as HTMLButtonElement).addEventListener("click", () => {
		setZrr(null);
	});

	(document.getElementById("sendZrrButton") as HTMLButtonElement).addEventListener("click", () => {
		sendZrr();
	});

	(document.getElementById("setTtlButton") as HTMLButtonElement).addEventListener("click", () => {
		setTtl();
	});
}
  
function updateLatValue(lat: number): void {
	(document.getElementById("lat") as HTMLInputElement).value = lat.toString();
}

function updateLonValue(lng: number): void {
	(document.getElementById("lon") as HTMLInputElement).value = lng.toString();
}

function updateZoomValue(zoom: number): void {
	(document.getElementById("zoom") as HTMLInputElement).value = zoom.toString();
}

function setZrr(bounds: any): void {
	console.log("TODO: update input values...");
}

function sendZrr(): void {
	console.log("TODO: send fetch request...");
}

function setTtl(): void {
	console.log("TODO: send fetch request...");
}

export { updateLatValue, updateLonValue, updateZoomValue };
export default initListeners;