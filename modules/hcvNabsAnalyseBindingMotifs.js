function StringBuffer() {
    this.__strings__ = new Array;
}
 
StringBuffer.prototype.append = function (str) {
    this.__strings__.push(str);
};
 
StringBuffer.prototype.toString = function () {
    return this.__strings__.join("");
};
 
function analyse() {

	var output = new StringBuffer();

	var acsModules = tableResultGetColumn(glue.command(["list", "module", "-w", "name like 'hcvNabs_acs%'"]), "name");
	//var acsModules = tableResultGetColumn(glue.command(["list", "module", "-w", "name like 'hcvNabs_acs_441_%'"]), "name");
	
	var cladesToAnalyse = clades;
	//var cladesToAnalyse = ["AL_2", "AL_3b"];
	_.each(acsModules, function(acsModule) {
		var antibodies = tableResultGetColumn(
			glue.command(["list", "custom-table-row", "antibody", "-w", "col_selector_name = '"+acsModule+"'", "display_name"]), "display_name");
		
		_.each(cladesToAnalyse, function(almtName) {
			glue.inMode("alignment/"+almtName, function() {
				var cladeName = glue.command("show property displayName").propertyValueResult.value;
				var bindingLocs = acsModule.replace("hcvNabs_acs_", "");
				output.append("Motifs for binding location set: "+bindingLocs.replace(/_/g, ","));
				output.append(" in "+cladeName);
				output.append(" (antibodies: ["+antibodies.join(", ")+"])\n");
				var aaStringObjs = glue.command(["amino-acid", "strings", "-c", "-w", "sequence.source.name = 'ncbi-curated'", 
				              "-a", acsModule, "-f", "precursor_polyprotein", "-s"], {convertTableToObjects:true});
				_.each(aaStringObjs, function(aaStringObj) {
					output.append("\n"+aaStringObj.aminoAcidString+" ");
					output.append(toFixed(aaStringObj.pctMembers,2)+"% (n="+aaStringObj.numMembers+")");
				});
				output.append("\n---------------------------------------------------------------------------------------\n");
			});
		});
		output.append("\n");
	});
	glue.command(["file-util", "save-string", output.toString(), "tabular/bindingMotifsReport.txt"]);
}


function toFixed(value, precision) {
	var precision = precision || 0,
	power = Math.pow(10, precision),
	absValue = Math.abs(Math.round(value * power)),
	result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

	if (precision > 0) {
		var fraction = String(absValue % power),
		padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
		result += '.' + padding + fraction;
	}
	return result;
}
