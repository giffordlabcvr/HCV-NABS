function StringBuffer() {
    this.__strings__ = new Array;
}
 
StringBuffer.prototype.append = function (str) {
    this.__strings__.push(str);
};
 
StringBuffer.prototype.toString = function () {
    return this.__strings__.join("");
};
 
function bindingResiduesReport() {

	var br_locations = tableResultGetColumn(glue.command(["list", "custom-table-row", "br_location"]), "id");

	var output = new StringBuffer();
	
	_.each(br_locations, function(br_location_id) {
		output.append("Binding residue location "+br_location_id+"\n");
		glue.inMode("custom-table-row/br_location/"+br_location_id, function() {
			var antibodies = tableResultGetColumn(glue.command("list link-target antibody_br_loc antibody.display_name"), "antibody.display_name");
			output.append("Neutralizing antibodies: "+antibodies.join(", "));
		});
		_.each(clades, function(clade) {
			glue.inMode("alignment/"+clade, function() {
				var cladeName = glue.command("show property displayName").propertyValueResult.value;
				output.append("\n"+cladeName+":");
			});
			var noteWhereClause = "alignment.name = '"+clade+"' and variation.featureLoc.feature.name = 'BR"+br_location_id+"'";
			var notes = glue.tableToObjects(glue.command(["list", "var-almt-note", 
			              "--sortProperties", "-hcv_nabs_frequency",
			              "--whereClause", noteWhereClause, 
			              "variation.hcv_nabs_amino_acid", "hcv_nabs_frequency", "hcv_nabs_number"]));
			_.each(notes, function(note) {
				output.append("\t");
				output.append(note["variation.hcv_nabs_amino_acid"]);
				output.append(" ");
				output.append(toFixed(note["hcv_nabs_frequency"], 2));
				output.append("% (n=");
				output.append(note["hcv_nabs_number"]);
				output.append(")");
			});
		});
		output.append("\n\n");
		
	});
	glue.command(["file-util", "save-string", output.toString(), "tabular/bindingResiduesReport.txt"]);
	
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

