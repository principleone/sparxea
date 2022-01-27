!INC Local Scripts.EAConstants-JScript
!INC P1Core.P1Solution
 
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();

	switch ( treeSelectedType )
	{

		case otPackage :
		{
			// Code for when a package is selected
			var thePackage as EA.Package;
			thePackage = Repository.GetTreeSelectedObject();
			addSubSystemPkgs(thePackage);
			break;
		}

		default:
		{
			// Error message
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

OnProjectBrowserScript();
