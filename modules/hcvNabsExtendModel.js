
function extendModel() {
	var antibodyEpitopeTable = null;
	glue.inMode("module/hcvNabsTabularUtility", function() {
		antibodyEpitopeTable = glue.command(["load-tabular", "tabular/antibodyEpitopeTable.txt"], {convertTableToObjects:true});
	});
	var positionToAntibodies = {};
	_.each(antibodyEpitopeTable, function(abEpRow) {
		if(abEpRow["Neutralizing?"] == "Y") {
			var antibody_name = abEpRow["Antibody"];
			var antibody_id = antibody_name.replace("/", "_");
			glue.command(["create", "custom-table-row", "--allowExisting", "antibody", antibody_id]);	
			glue.inMode("custom-table-row/antibody/"+antibody_id, function() {
				glue.command(["set", "field", "display_name", antibody_name]);
				glue.command(["set", "field", "neutralizing", "true"]);
			});
			for(var i = 1; i <= 9; i++) {
				var br = abEpRow["BR"+i];
				if(br != null) {
					if(br.startsWith("E1 ")) {
						br = br.substring(3, br.length);
					}
					var pos = br.substring(1, br.length);
					var currentList = positionToAntibodies[pos];
					if(currentList == null) {
						currentList = [];
						positionToAntibodies[pos] = currentList;
					}
					currentList.push(antibody_id);
				}
			}
		}
	});

	var positionAntibodiesPairs = _.pairs(positionToAntibodies);

	_.each(positionAntibodiesPairs, function(positionAntibodiesPair) {
		var position = positionAntibodiesPair[0];
		var antibodies = positionAntibodiesPair[1];
		var featureName = "BR"+position;
		glue.command(["create", "custom-table-row", "br_location", position]);
		glue.command(["create", "feature", featureName, "--parentName", "precursor_polyprotein", "Binding residue location"]);
		glue.inMode("/feature/"+featureName, function() {
			glue.command(["set", "metatag", "CODES_AMINO_ACIDS", "true"]);
			glue.command(["set", "metatag", "OWN_CODON_NUMBERING", "false"]);
		});
		glue.inMode("/reference/REF_MASTER_NC_004102", function() {
			glue.command(["add", "feature-location", featureName]);
			glue.inMode("/feature-location/"+featureName, function() {
				glue.command(["add", "segment", "--labeledCodon", position, position]);
				glue.command(["set", "link-target", "br_location", "custom-table-row/br_location/"+position]);
			});
		});
		_.each(antibodies, function(antibody_id) {
			glue.command(["create", "custom-table-row", "--allowExisting", "antibody_br_loc", antibody_id+"_"+position]);
			glue.inMode("custom-table-row/antibody_br_loc/"+antibody_id+"_"+position, function() {
				glue.command(["set", "link-target", "br_location", "custom-table-row/br_location/"+position]);
				glue.command(["set", "link-target", "antibody", "custom-table-row/antibody/"+antibody_id]);
			});
		});
		
	});

}


