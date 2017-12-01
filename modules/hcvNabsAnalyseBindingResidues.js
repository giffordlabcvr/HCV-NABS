
function analyse() {

	var br_locations = tableResultGetColumn(glue.command(["list", "custom-table-row", "br_location"]), "id");

	_.each(br_locations, function(br_location_id) {
		_.each(clades, function(clade) {
			glue.log("INFO", "BR position "+br_location_id+", clade "+clade);
			var freqResults;
			glue.inMode("alignment/"+clade, function() {
				freqResults = glue.command(["amino-acid", "frequency", "--recursive", "--whereClause", "sequence.source.name = 'ncbi-curated'",
				                                "--acRefName", "REF_MASTER_NC_004102", "--featureName", "BR"+br_location_id], 
				                                {convertTableToObjects:true});
			});
			_.each(freqResults, function(freqResult) {
				glue.inMode("reference/REF_MASTER_NC_004102/feature-location/BR"+br_location_id, function() {
					glue.command(["create", "variation", "BR_"+freqResult.aminoAcid, "--translationType", "AMINO_ACID",
					              "Occurance of "+freqResult.aminoAcid+" at binding residue "+br_location_id]);
					glue.inMode("variation/"+"BR_"+freqResult.aminoAcid, function() {
						glue.command(["set", "field", "hcv_nabs_amino_acid", freqResult.aminoAcid]);
						glue.command(["create", "pattern-location", freqResult.aminoAcid, "--labeledCodon", br_location_id,br_location_id]);
						glue.command(["create", "var-almt-note", clade]);
						glue.inMode("var-almt-note/"+clade, function() {
							glue.command(["set", "field", "hcv_nabs_frequency", freqResult.pctMembers]);
							glue.command(["set", "field", "hcv_nabs_number", freqResult.numMembers]);
						});
						
					});
				});
			});
		});
	});
}