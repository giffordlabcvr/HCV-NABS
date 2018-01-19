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

	var regions = _.values(antibodiesToBindingRegions());
	
	var cladesToAnalyse = clades;
	//var cladesToAnalyse = ["AL_2", "AL_3b"];
	_.each(regions, function(region) {
		_.each(cladesToAnalyse, function(almtName) {
			glue.inMode("alignment/"+almtName, function() {
				var refName = glue.command(["show", "reference"]).showReferenceResult.referenceName;
				var cladeName = glue.command("show property displayName").propertyValueResult.value;
				output.append("Region "+region.start+"-"+region.end);
				output.append(" (antibodies: ["+region.antibodies.join(", ")+"]), ");
				output.append(cladeName+":\n");
				var aaStringObjs = glue.command(["amino-acid", "strings", "-c", "-w", "sequence.source.name = 'ncbi-curated'", 
				              "-r", refName, "-f", "precursor_polyprotein", region.start, region.end], {convertTableToObjects:true});
				_.each(aaStringObjs, function(aaStringObj) {
					output.append("\n"+aaStringObj.aminoAcidString+" ");
					output.append(toFixed(aaStringObj.pctMembers,2)+"% (n="+aaStringObj.numMembers+")");
				});
				output.append("\n---------------------------------------------------------------------------------------\n");
			});
		});
		output.append("\n");
	});
	glue.command(["file-util", "save-string", output.toString(), "tabular/regionsReport.txt"]);
}

function numericComp(a, b) {
	if(a < b) {
		return -1;
	}
	if(a > b) {
		return 1;
	}
	return 0;
}

function antibodiesToBindingRegions() {
	var regionStringToObj = {};
	
	var antibodies = tableResultGetColumn(glue.command(["list", "custom-table-row", "antibody"]), "id");
	//var antibodies = tableResultGetColumn(glue.command(["list", "custom-table-row", "antibody", "-w", "id in ('HCV1', 'AR4A')"]), "id");

	_.each(antibodies, function(antibodyID) {
		var br_loc_ids;
		glue.inMode("custom-table-row/antibody/"+antibodyID, function(){
			br_loc_ids = tableResultGetColumn(glue.command(["list", "link-target", "antibody_br_loc", "br_location.id"]), "br_location.id");
		});
		var br_loc_nums = _.map(br_loc_ids, function(id) { return parseInt(id); });
		br_loc_nums = br_loc_nums.sort(numericComp);

		var currentRegionStart = null;
		var currentRegionEnd = null;
		var regions = [];
		if(br_loc_nums.length > 0) {
			for(var i = 0; i < br_loc_nums.length; i++) {
				var loc = br_loc_nums[i];
				if(currentRegionStart == null) {
					currentRegionStart = loc-1;
					currentRegionEnd = loc+1;
				} else if(loc - currentRegionEnd < 5) {
					currentRegionEnd = loc+1;
				} else {
					regions.push({start:currentRegionStart, end:currentRegionEnd});
					currentRegionStart = loc-1;
					currentRegionEnd = loc+1;
				}
			}
			regions.push({start:currentRegionStart, end:currentRegionEnd});
		}
		_.each(regions, function(region) {
			var regionString = region.start+"-"+region.end;	
			var currentObj = regionStringToObj[regionString];
			if(currentObj == null) {
				currentObj = region;
				currentObj.antibodies = [];
				regionStringToObj[regionString] = currentObj;
			}
			currentObj.antibodies.push(antibodyID);
			
		}); 
	});
	return regionStringToObj;
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
