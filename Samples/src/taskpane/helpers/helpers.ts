
export function isNullOrUndefined(value: any) {
	if (value === null || value === undefined) {
		return true;
	}
	return false;
}

export function isNullOrUndefinedOrEmptyString(value: any) {
	if (value === null || value === undefined || value === "") {
		return true;
	}
	return false;
}

export function isValidName(name, min, max) {
	if (!isNullOrUndefined(name)) {
		var trimmed = name.trim();
		if (trimmed.length >= min && trimmed.length <= max) {
			return true;
		}
	}
	return false;
}

export function formatDate(date?: Date): string {
	if (!isValidDate(date)) {
		return null
	}
	return !date ? '' : date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getFullYear() % 100);
};

export function formatDateYYYYMMDD(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}

export function isValidDate(d: Date): boolean {
	if (isNullOrUndefined(d)) {
		return false
	}
	var timestamp = Date.parse(d.toDateString())
	return !isNaN(timestamp)
}

export function removeTags(str) {
	if ((str === null) || (str === ''))
		return false;
	else
		str = str.toString();

	var string = str.replace(/(<style[\w\W]+style>)/g, "");
	string = string.substring(string.indexOf("tbody") + 6);
	string = string.substring(0, string.indexOf("tbody") - 2)
	string = string.replace(/(<([^>]+)>)/ig, '\n');
	return string.trim();
}