!INC Local Scripts.EAConstants-JScript
//!INC P1 Browser Scripts.P1 Structure/*
/* This code has been included from the default Project Browser template.
* If you wish to modify this template, it is located in the Config\Script Templates
* directory of your EA install path.
*
* Script Name:
* Author:
* Purpose:
* Date:
*//*
* Project Browser Script main function
*/
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	if (treeSelectedType == otElement) 
	{
		// get name and parent package of selected element
		var element as EA.Element;
		element = Repository.GetTreeSelectedElements().GetAt(0);
		var elementName = element.Name;
		var parentPackage as EA.Package;
		// create new package
		parentPackage = Repository.GetTreeSelectedPackage();
		newPackage = parentPackage.Packages.AddNew(elementName, "" );
		newPackage.Update();

		// create new trace dependency
		var newConnector as EA.Connector;
		newConnector = element.Connectors.AddNew('','Dependency');
		newConnector.Stereotype = 'EAUML::trace';
		// get element ID from source end
		newConnector.ClientID = element.ElementID;
		// get element ID from target end
		newConnector.SupplierID = newPackage.Element.ElementID;
		newConnector.Update();

		// add diagram to the new package
		var newDiagram as EA.Diagram;
		var diagName = element.Name + ' Package Digram';
		newDiagram = newPackage.Diagrams.AddNew(diagName, 'p1Profile::Context' );
		// set version and style
		newDiagram.Version = 0.1;
		newDiagram.StyleEx = 'Whiteboard=1';
		newDiagram.Update();
		// add elements to diagram
		var diagObjects as EA.Collection;
		diagObjects = newDiagram.DiagramObjects;
		var IDs = [element.ElementID, newPackage.Element.ElementID];
		var positions = ['l=100;r=100;t=100;b=100;','l=100;r=100;t=100;b=100;'];
		for (i in [1,2]) {
			var newObject as EA.DiagramObject;
			newObject = diagObjects.AddNew(positions[i],'');
			newObject.ElementID = IDs[i];
			newObject.Update();
		}
		// layout 
		Repository.GetProjectInterface().LayoutDiagramEx(newDiagram.DiagramGUID,lsLayeringOptimalLinkLength,1,20,20,false)
		newDiagram.Update()

		// add tag to element
		var newTag as EA.TaggedValue;
		newTag = element.TaggedValues.AddNew('tag','');
		newTag.Value = '';
		newTag.Update();

		// add stereotype to element
		element.Stereotype = 'stereotype';
		element.Update();
	} 
	else 
	{
		Session.Prompt( "This script does not support items of this type." , promptOK );
	}
}



