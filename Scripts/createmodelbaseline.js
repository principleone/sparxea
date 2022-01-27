!INC Local Scripts.EAConstants-JScript
!INC EAScriptLib.JScript-XML
!INC EAScriptLib.JScript-Database

/*
 * Script Name: Create Model baseline
 * Author: AndrewDixon
 * Purpose: database hosted model backups for versioning
 * Date: 5/03/2021
 */
 
function CreateModelBaseline()
{
	// Query db
	var RootPackageIds = DBGetFieldValueArrayString("package_id", "t_package", "Parent_ID=0");
	
	// loop through root node ids
	for ( var i = 0 ; i < RootPackageIds.length ; i++ )
	{
		// get root node package object
		var RootPackage as EA.Package;
		RootPackage = Repository.GetPackageByID(RootPackageIds[i]);

		// get project object
		var Project as EA.Project;
		Project = Repository.GetProjectInterface();
		
		// baslines updated by script at the minor version level
		var PreviousBaselineVersion = DBGetFieldValueString("version", "t_document", "DocType=\"Baseline\" and DocName = \"" + RootPackage.Name + "\"");
		var NewBaselineVersion = UpdateVersion(PreviousBaselineVersion);
		
		// construct baseline note
		var note = "Scripted baseline timestamp: " + DateTimeStamp();
		
		// baseline package
		Project.CreateBaseline(RootPackage.PackageGUID, NewBaselineVersion, note);
	}
}

function DateTimeStamp()
{
	var m = new Date();
	var dateString =
		("0" + m.getUTCDate()).slice(-2) + "/" +
		("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
		m.getUTCFullYear() + " " +
		("0" + m.getUTCHours()).slice(-2) + ":" +
		("0" + m.getUTCMinutes()).slice(-2) + ":" +
		("0" + m.getUTCSeconds()).slice(-2);
	return dateString;
}

function UpdateVersion(version)
{
	var SemVerSplit = version.split(".");
	SemVerSplit[1] = parseInt(SemVerSplit[1]) + 1;
	version = SemVerSplit.join(".");
	return version;
}

CreateModelBaseline();
