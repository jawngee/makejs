/**
 * Template helpers
 */


/**
 * Formats an unix timestamp as a string
 */
function epoch(data,format,nullvalue) {
	if ((data==0)||(data==null))
		return nullvalue;

	d=new Date(data*1000);
	return d.format(format);
}