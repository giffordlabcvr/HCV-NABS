


function featureCoverageByCountryAndClade(featureName) {
	var coveragePct = 90;

	var countryObjList = glue.tableToObjects(glue.command(["list", "custom-table-row", "who_country", "id", "display_name"]));
	countryObjList.push({id:"no_country_specified", display_name:"No country specified"});
	
	var cladeObjList = [];

	_.each(clades, function(almtName) {
		var cladeObj = {};
		glue.logInfo("Clade: "+almtName);
		glue.inMode("alignment/"+almtName, function() {
			cladeObj.id = almtName;
			cladeObj.display_name = glue.command("show property displayName").propertyValueResult.value;
		});
		cladeObjList.push(cladeObj);
	});
	
	var whereClause = "sequence.source.name = 'ncbi-curated' and "+
		"referenceMember = false and "+
		"fLocNotes.featureLoc.referenceSequence.name = 'REF_MASTER_NC_004102' and "+
		"fLocNotes.featureLoc.feature.name = '"+featureName+"' and "+
		"fLocNotes.ref_nt_coverage_pct >= "+coveragePct;
	
	_.each(countryObjList, function(countryObj) {
		glue.logInfo("Country: "+countryObj.display_name);
		_.each(cladeObjList, function(cladeObj) {
			var cWhereClause;
			if(countryObj.id == 'no_country_specified') {
				cWhereClause = whereClause+" and sequence.who_country = null";
			} else {
				cWhereClause = whereClause+" and sequence.who_country = '"+countryObj.id+"'";
			}
			glue.inMode("alignment/"+cladeObj.id, function() {
				var result = glue.command(
						{"count":{"member":{"recursive":"true",
							"whereClause": cWhereClause}}});
				countryObj[cladeObj.display_name] = result.countResult.count;
			});
		});
	});
	return countryObjList;
}

