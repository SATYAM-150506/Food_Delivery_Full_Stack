/**
 * Formats a date to DD/MM/YYYY HH:mm
 */
exports.formatDateTime = (date) => {
	const d = new Date(date);
	return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Sorts an array of objects by date property (descending)
 */
exports.sortByDateDesc = (arr, dateProp = 'createdAt') => {
	return arr.sort((a, b) => new Date(b[dateProp]) - new Date(a[dateProp]));
};

/**
 * Returns minutes difference between two dates
 */
exports.getMinutesDiff = (date1, date2) => {
	return Math.abs((new Date(date1) - new Date(date2)) / (1000 * 60));
};
