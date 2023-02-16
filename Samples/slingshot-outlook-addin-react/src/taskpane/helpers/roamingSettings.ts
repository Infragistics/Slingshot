// roaming storage management

export function getRoamingSetting(name: string) {
	return Office.context.roamingSettings.get(name);
}

export function setRoamingSetting(name: string, value: any) {
	Office.context.roamingSettings.set(name, value);
}

export function removeRoamingSetting(name: string) {
	Office.context.roamingSettings.remove(name);
}

export function saveRoamingSettings(callback?: any) {
	Office.context.roamingSettings.saveAsync(function (result) {
		if (result.status !== Office.AsyncResultStatus.Succeeded) {
			console.error(`Action failed with message ${result.error.message}`);
		} else {
			console.log(`Settings saved with status: ${result.status}`);
			if (callback != null) {
				callback(result);
			}
		}
	});
}