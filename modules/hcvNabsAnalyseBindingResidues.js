
function analyseSingleBr(br_location_id) {
	_.each(clades, function(clade) {
		glue.log("INFO", "BR position "+br_location_id+", clade "+clade);
		var freqResults;
		glue.inMode("alignment/"+clade, function() {
			freqResults = glue.tableToObjects(glue.command(["amino-acid", "frequency", "--recursive", "--whereClause", "sequence.source.name = 'ncbi-curated'",
			                                "--relRefName", "REF_MASTER_NC_004102", "--featureName", "BR"+br_location_id]));
		});
		glue.inMode("reference/REF_MASTER_NC_004102/feature-location/BR"+br_location_id, function() {
			var brVariationNames = tableResultGetColumn(glue.command(["list", "variation", "--whereClause", "name like 'BR%'"]), "name");
			_.each(freqResults, function(freqResult) {
				var variationName = "BR_"+freqResult.aminoAcid;
				if(brVariationNames.indexOf(variationName) < 0) {
					glue.command(["create", "variation", variationName, "--vtype", "aminoAcidSimplePolymorphism",
					              "-d", "Occurance of "+freqResult.aminoAcid+" at binding residue "+br_location_id, 
					              "--labeledCodon", br_location_id,br_location_id]);
					glue.inMode("variation/"+variationName, function() {
						glue.command(["set", "field", "hcv_nabs_amino_acid", freqResult.aminoAcid]);
						glue.command(["set", "metatag", "SIMPLE_AA_PATTERN", freqResult.aminoAcid]);

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

	// var br_locations = tableResultGetColumn(glue.command(["list", "custom-table-row", "br_location"]), "id");
	
    // AR3 group new locations
	// var br_locations = ["427", "429", "430", "432", "440", "459", "485", "499", "503", "515", "517", "518", "520", "536", "558"];
	
	// DAO1 locations
	var br_locations = ["495", "512", "517", "523", "525", "526", "527", "535", "558", "615", "636", "639"];

	
	_.each(br_locations, function(br_location_id) {
		analyseSingleBr(br_location_id);
	});
}