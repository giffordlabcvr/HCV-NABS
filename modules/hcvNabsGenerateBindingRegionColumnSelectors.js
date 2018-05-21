
function numericComp(a, b) {
	if(a < b) {
		return -1;
	}
	if(a > b) {
		return 1;
	}
	return 0;
}

function generateSelectors() {
	var antibodies = tableResultGetColumn(glue.command(["list", "custom-table-row", "antibody"]), "id");
	//var antibodies = tableResultGetColumn(glue.command(["list", "custom-table-row", "antibody", "-w", "id in ('HCV1', 'AR4A')"]), "id");

	_.each(antibodies, function(antibodyID) {
		var br_loc_ids;
		glue.inMode("custom-table-row/antibody/"+antibodyID, function(){
			br_loc_ids = tableResultGetColumn(glue.command(["list",	 "link-target", "antibody_br_loc", "br_location.id"]), "br_location.id");
		});
		var br_loc_nums = _.map(br_loc_ids, function(id) { return parseInt(id); });
		br_loc_nums = br_loc_nums.sort(numericComp);

		var moduleName = "hcvNabs_acs_"+antibodyID;
		
		glue.command(["create", "module", "--moduleType", "alignmentColumnsSelector", moduleName]);
		glue.inMode("module/"+moduleName, function(){
			glue.command(["set", "property", "relRefName", "REF_MASTER_NC_004102"]);
			_.each(br_loc_nums, function(br_loc_num) {
				glue.command(["add", "region-selector", "-f", "precursor_polyprotein", "-a", "-l", br_loc_num, br_loc_num]);
			});
		});

		glue.inMode("custom-table-row/antibody/"+antibodyID, function(){
			glue.command(["set", "field", "col_selector_name", moduleName]);
		});
	});
}
