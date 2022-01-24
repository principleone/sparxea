!INC Local Scripts.EAConstants-JScript
!INC P1Core.P1Core
!INC P1Core.P1Solution

/*
 * This code has been included from the default Diagram Script template.
 * If you wish to modify this template, it is located in the Config\Script Templates
 * directory of your EA install path.
 *
 * Script Name:
 * Author:
 * Purpose:
 * Date:
 */

// CURRENTLY ADDS IN A BUNCH OF CONNECTORS WE PROBABLY DON'T WANT - NEED TO FIX

function OnDiagramScript()
{
	// Get a reference to the current diagram
	var currentDiagram as EA.Diagram;
	currentDiagram = Repository.GetCurrentDiagram();

	if ( currentDiagram != null )
	{
		// get GUIDs of all elements in the diagram
		var diagElements = getDiagElements(currentDiagram);
		var diagElemGUIDs = getGUIDs(diagElements);
		
		// For testing: navigate to Architecture Model package by going up and down the tree
//		var thePackage as EA.Package;
//		thePackage = Repository.GetPackageByID(currentDiagram.PackageID);
//		while (thePackage.Name != 'Model') 
//		{
//		thePackage = Repository.GetPackageByID(thePackage.Element.PackageID);
//		}
//		thePackage = thePackage.Packages.GetByName('Solution - Target State');
//		thePackage = thePackage.Packages.GetByName('Architecture Model');
		
		// For actual use: use control object to get Architecture Model package
		thePackage = getPackages().arcModelPkg
		
		// Find the Enterprise Application Architecture package
		thePackage = thePackage.Packages.GetByName('Enterprise');
		thePackage = thePackage.Packages.GetByName('Application Architecture');
		
		// get all elements in Enterprise Application Architecture pkg (all systems in model)
		var systems as EA.Collection;
		systems = thePackage.Elements;
		
		// set left edge position for first new object in diagram
		var basePosition = 220;
		
		var links = currentDiagram.DiagramLinks.Count;
		
		// loop over systems
		var system as EA.Element;
		for (var i = 0; i < systems.Count; i++)
		{
			system = systems.GetAt(i);
			// if the system is not present in the diagram
			if (!diagElemGUIDs.includes(system.ElementGUID))
			{	
				// add system to diagram
				var pos = 'l='+String(basePosition)+';r='+String(basePosition+100)+';t=-20;b=-90;'
				p1AddToDiag(currentDiagram,system,pos);
				
				// adjust base position for next component
				basePosition += 110;
			}
		}
		
		currentDiagram.Update();

		// TO DO: figure out how to remove stuff from an EA.Collection
		// remove additional connectors added along with the system 
//		currentDiagram = Repository.GetCurrentDiagram();
//		for (var j = currentDiagram.DiagramLinks.Count - 1; j >= links; j--) {
//			currentDiagram.DiagramLinks.DeleteAt(j,true);
//			currentDiagram.DiagramLinks.Delete(j);
//			currentDiagram.DiagramLinks.Refresh();
//		}
//		currentDiagram.Update();
	}
	else
	{
		Session.Prompt( "This script requires a diagram to be visible.", promptOK)
	}
}

OnDiagramScript();
