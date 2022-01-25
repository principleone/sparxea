!INC Local Scripts.EAConstants-JScript
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

function OnDiagramScript()
{
	// Get a reference to the current diagram
	var currentDiagram as EA.Diagram;
	currentDiagram = Repository.GetCurrentDiagram();

	if ( currentDiagram != null )
	{
		// Currently gets all elements in the diagram, if there is one system then assume that is the system of focus
		// Maybe get the diagram reference (by selecting ea_guid from t_object where pdata1 is the diagram ID)
		// and get the element of focus using the p1.Dia.Scope tagged value (bit more robust)
		
		// get array of elements in diagram
		var diagElements = getDiagElements(currentDiagram);
		
		// loop over diagram elements
		var theElement as EA.Element;
		var elementArray = [];
		for (var i = 0; i < diagElements.length; i++) {
			theElement = diagElements[i];
			// if the element is a system
			if (theElement.Stereotype == 'System') {
				// add to array of systems in the diagram
				elementArray.push(theElement);
			}
		}
		
		// if one system in diagram
		if (elementArray.length == 1) {
			// update the diagram with child elements of this system
			theElement = sysArray[0];
			updateDiagram(theElement,currentDiagram);
			Session.Prompt(theElement.Name+' Decomposition diagram updated. Close and reopen the diagram.',promptOK);
		} else if (elementArray.length == 0) {
			Session.Prompt("Error: No systems found on this diagram.",promptOK);
		} else if (elementArray.length > 1) {
			Session.Prompt("Error: Multiple systems found on this diagram",promptOK);
		}
	}
	else
	{
		Session.Prompt("This script requires a diagram to be visible.",promptOK);
	}
}

OnDiagramScript();
