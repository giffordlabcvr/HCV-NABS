


function featureCoverageByRegionAndClade(featureName) {
	var coveragePct = 90;

	var subRegionObjList = glue.tableToObjects(glue.command(["list", "custom-table-row", "who_sub_region", "id", "display_name"]));
	var cladeObjList = [];
	var whereClause = "sequence.source.name = 'ncbi-curated' and "+
		"referenceMember = false and "+
		"fLocNotes.featureLoc.referenceSequence.name = 'REF_MASTER_NC_004102' and "+
		"fLocNotes.featureLoc.feature.name = '"+featureName+"' and "+
		"fLocNotes.ref_nt_coverage_pct >= "+coveragePct;
	
	_.each(clades, function(almtName) {
		var cladeObj = {};
		glue.logInfo("Clade: "+almtName);
		glue.inMode("alignment/"+almtName, function() {
			cladeObj["Clade"] = glue.command("show property displayName").propertyValueResult.value;
		});
		_.each(subRegionObjList, function(subRegionObj) {
			glue.logInfo("Sub-region: "+subRegionObj.display_name);
			glue.inMode("alignment/"+almtName, function() {
				var result = glue.command(
						{"count":{"member":{"recursive":"true",
							"whereClause":
								whereClause+" and sequence.who_country.who_sub_region = '"+subRegionObj.id+"'"}}});
				cladeObj[subRegionObj.display_name] = result.countResult.count;
			});
		});
		glue.inMode("alignment/"+almtName, function() {
			cladeObj["No country specified"] = glue.command(
					{"count":{"member":{"recursive":"true",
						"whereClause": whereClause+" and sequence.who_country = null"}}}).countResult.count;
			cladeObj["Total"] = glue.command(
					{"count":{"member":{"recursive":"true",
						"whereClause": whereClause}}}).countResult.count;
		});
		cladeObjList.push(cladeObj);
	});
	return cladeObjList;
}

