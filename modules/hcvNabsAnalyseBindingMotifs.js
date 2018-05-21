function StringBuffer() {
    this.__strings__ = new Array;
}
 
StringBuffer.prototype.append = function (str) {
    this.__strings__.push(str);
};
 
StringBuffer.prototype.toString = function () {
    return this.__strings__.join("");
};

function numericComp(a, b) {
	if(a < b) {
		return -1;
	}
	if(a > b) {
		return 1;
	}
	return 0;
}
 
function analyse() {

	var output = new StringBuffer();

	var acsModules = tableResultGetColumn(glue.command(["list", "module", "-w", "name like 'hcvNabs_acs%'"]), "name");
	// var acsModules = ["hcvNabs_acs_J6.36", "hcvNabs_acs_MAb44"];
	
	var cladesToAnalyse = clades;
	// var cladesToAnalyse = ["AL_2", "AL_3b"];
	_.each(acsModules, function(acsModule) {

		var antibodyID = acsModule.replace("hcvNabs_acs_", "");
		glue.log("FINEST", "antibodyID", antibodyID);
		var br_loc_ids;
		glue.inMode("custom-table-row/antibody/"+antibodyID, function(){
			br_loc_ids = tableResultGetColumn(glue.command(["list",	 "link-target", "antibody_br_loc", "br_location.id"]), "br_location.id");
		});
		var br_loc_nums = _.map(br_loc_ids, function(id) { return parseInt(id); });
		br_loc_nums = br_loc_nums.sort(numericComp);
		
		_.each(cladesToAnalyse, function(almtName) {
			glue.inMode("alignment/"+almtName, function() {
				var cladeName = glue.command("show property displayName").propertyValueResult.value;
				glue.log("FINEST", "cladeName", cladeName);
				output.append("Motifs for binding location set: "+br_loc_nums.join(","));
				output.append(" in "+cladeName);
				output.append(" (antibody: "+antibodyID+")\n");
				var aaStringObjs = glue.tableToObjects(glue.command(["amino-acid", "strings", "-c", "-w", "sequence.source.name = 'ncbi-curated'", 
				                                 "-x", "-a", acsModule, "-f", "precursor_polyprotein", "-s"]));
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
