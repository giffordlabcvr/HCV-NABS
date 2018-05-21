
function analyseSingleBr(br_location_id) {
	_.each(clades, function(clade) {
		glue.log("INFO", "BR position "+br_location_id+", clade "+clade);
		var freqResults;
		glue.inMode("alignment/"+clade, function() {
			freqResults = glue.tableToObjects(glue.command(["amino-acid", "frequency", "--recursive", "--whereClause", "sequence.source.name = 'ncbi-curated'",
			                                "--acRefName", "REF_MASTER_NC_004102", "--featureName", "BR"+br_location_id]));
		});
		glue.inMode("reference/REF_MASTER_NC_004102/feature-location/BR"+br_location_id, function() {
			var brVariationNames = tableResultGetColumn(glue.command(["list", "variation", "--whereClause", "name like 'BR%'"]), "name");
			_.each(freqResults, function(freqResult) {
				var variationName = "BR_"+freqResult.aminoAcid;
				if(brVariationNames.indexOf(variationName) < 0) {
					glue.command(["create", "variation", variationName, "--translationType", "AMINO_ACID",
					              "Occurance of "+freqResult.aminoAcid+" at binding residue "+br_location_id]);
					glue.inMode("variation/"+variationName, function() {
						glue.command(["set", "field", "hcv_nabs_amino_acid", freqResult.aminoAcid]);
						glue.command(["create", "pattern-location", freqResult.aminoAcid, "--labeledCodon", br_location_id,br_location_id]);

					});
				}
				glue.inMode("variation/"+variationName, function() {
					glue.command(["create", "var-almt-note", clade]);
					glue.inMode("var-almt-note/"+clade, function() {
						glue.command(["set", "field", "hcv_nabs_frequency", freqResult.pctMembers]);
						glue.command(["set", "field", "hcv_nabs_number", freqResult.numMembers]);
					});

				});
			});
		});
	});
} 

function analyse() {

	var br_locations = tableResultGetColumn(glue.command(["list", "custom-table-row", "br_location"]), "id");
	
    // AR3 group new locations
	//var br_locations = ["427", "429", "430", "432", "440", "459", "485", "499", "503", "515", "517", "518", "520", "536", "558"];

	
	_.each(br_locations, function(br_location_id) {
		analyseSingleBr(br_location_id);
	});
}