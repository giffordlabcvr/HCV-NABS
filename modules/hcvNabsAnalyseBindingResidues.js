
function analyse() {
	var clades = ["AL_1", "AL_1a", "AL_1b", "AL_2", "AL_2a", "AL_2b", "AL_2c", "AL_3", "AL_3a", "AL_3b", "AL_4", "AL_4a", "AL_4d", "AL_5", "AL_6", "AL_6a", "AL_7"];

	var antibodyEpitopeTable = null;
	glue.inMode("module/hcvNabsTabularUtility", function() {
		antibodyEpitopeTable = glue.command(["load-tabular", "tabular/antibodyEpitopeTable.txt"], {convertTableToObjects:true});
	});
	var positionToNabs = {};
	_.each(antibodyEpitopeTable, function(abEpRow) {
		if(abEpRow["Neutralizing?"] == "Y") {
			var antibody = abEpRow["Antibody"];
			for(var i = 1; i <= 9; i++) {
				var br = abEpRow["BR"+i];
				if(br != null) {
					if(br.startsWith("E1 ")) {
						br = br.substring(3, br.length);
					}
					var pos = br.substring(1, br.length);
					var currentList = positionToNabs[pos];
					if(currentList == null) {
						currentList = [];
						positionToNabs[pos] = currentList;
					}
					currentList.push(antibody);
				}
			}
		}
	});

	var positions = _.keys(positionToNabs);

	var positionInfos = [];

	_.each(positions, function(position) {
		var positionInfo = {};
		positionInfos.push(positionInfo);
		positionInfo.codonPosition = position;
		positionInfo["Neutralizing antibodies"] = positionToNabs[position].join(", ");
		_.each(clades, function(clade) {
			glue.inMode("alignment/"+clade, function() {
				var displayName = glue.command(["show", "property", "displayName"]).propertyValueResult.value;
				var freqResults = glue.command(["amino-acid", "frequency", "--recursive", "--whereClause", "sequence.source.name = 'ncbi-curated'",
				                                "--acRefName", "REF_MASTER_NC_004102", "--featureName", "precursor_polyprotein", 
				                                "--labelledCodon", position, position], {convertTableToObjects:true});
				freqResults = _.sortBy(freqResults, function(fr) { return -fr.pctMembers; });
				var summary = "";
				for(var i = 0; i < freqResults.length && i < 5; i++) {
					var freqResult = freqResults[i];
					if(i > 0) {
						summary = summary+", ";
					}
					summary = summary.concat(freqResult.aminoAcid).concat(" ").concat(toFixed(freqResult.pctMembers, 2)).concat("%(").concat(freqResult.numMembers).concat(")");
				}
				positionInfo[displayName] = summary;
			});
		});
	});

	return positionInfos;
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

