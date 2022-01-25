!INC Local Scripts.EAConstants-JScript
//!INC P1 Browser Scripts.P1 Structure/*
/* This code has been included from the default Project Browser template.
* If you wish to modify this template, it is located in the Config\Script Templates
* directory of your EA install path.
*
* Script Name: 
* Author:
* Purpose: Add a trace picture package, blank child diagrams and trace picture linking the element to it's child diagrams
* Date:
*//*
* Project Browser Script main function
*/

function OnDiagramScript()
{
   // get the current diagram
   var currentDiagram as EA.Diagram;
   currentDiagram = Repository.GetCurrentDiagram();

   if ( currentDiagram != null )
   {
	  // get selected objects
	  var selectedObject as EA.DiagramObject;
	  selectedObjects = currentDiagram.SelectedObjects;
	  
	  // only want one object
	  if (selectedObjects.Count > 1) {
		 Session.Prompt('This script required one element to be selected.',promptOK);
	  } 
	  else {
		  
		 // get element and stereotype
		 var selectedObject as EA.DiagramObject;
		 selectedObject = selectedObjects.GetAt(0);
		 var element as EA.Element;
		 element = Repository.GetElementByID(selectedObject.ElementID);
		 var stereotype = element.Stereotype;
		 
		 // get parent package of diagram and add new package
		 var parentPackage as EA.Package;
		 parentPackage = Repository.GetPackageByID(currentDiagram.PackageID);
		 var newPackage as EA.Package;
		 newPackage = parentPackage.Packages.AddNew('Trace Picture', "" );
		 newPackage.Update();
		 
		 // create trace picture
		 var tracePicture as EA.Diagram;
		 var diagName = element.Name + ' Trace Picture';
		 tracePicture = newPackage.Diagrams.AddNew(diagName, 'p1Profile::Trace' );
		 tracePicture.Version = 0.1;
		 // tracePicture.ShowDetails = 1; // properties without create/modified date
		 // properties note
		 var diagramNote as EA.Element;
		diagramNote = newPackage.Elements.AddNew( "", "Text" );
		diagramNote.Subtype = 18;
		diagramNote.Update(); // added later in loop. adding now causes blank diagram
		 tracePicture.Update();
		 
		 // create package for child diagrams
		 var childdiagPackage as EA.Package;
		 childdiagPackage = newPackage.Packages.AddNew('Child Diagrams', "" );
		 childdiagPackage.Update();
		 
		 // create child diagrams
		 var capabilitySummary as EA.Diagram;
		 capabilitySummary 
		 capabilitySummary.Update();
		 var conceptualSummary as EA.Diagram;
		 conceptualSummary = childdiagPackage.Diagrams.AddNew('', '' );
		 conceptualSummary.Update();
		 var bmSummary as EA.Diagram;
		 bmSummary = childdiagPackage.Diagrams.AddNew('', '' );
		 bmSummary.Update();
		 var sysContext as EA.Diagram;
		 sysContext = childdiagPackage.Diagrams.AddNew('', '' );
		 sysContext.Update();
		 var sysDecomp as EA.Diagram;
		 sysDecomp = childdiagPackage.Diagrams.AddNew('', '' );
		 sysDecomp.Update();
		 
		 // loop over diagrams for common properties
		 var childDiagrams = [capabilitySummary, conceptualSummary, bmSummary, sysContext, sysDecomp];
		 var names = ["Capability Summary","System Conceptual Summary","Business Motivation Summary",
		 "System Context","System Decomposition"];
		 var position = 'l=100;r=100;t=100;b=100;';
		 for (var i = 0; i < childDiagrams.length; i++) {
						
						childDiagrams[i] = childdiagPackage.Diagrams.AddNew('', '' );
						var diagram = childDiagrams[i];
						childDiagrams[i].Name = element.Name + ' ' + names[i];
						childDiagrams[i].Version = 0.1;
						var noteObject as EA.DiagramObject;
						noteObject = childDiagrams[i].DiagramObjects.AddNew(position,'');
						noteObject.ElementID = diagramNote.ElementID;
						noteObject.Update();
						childDiagrams[i].Update();
		 }
		 
		 // create reference elements for diagrams
		 diagramReferences = [];
		 for (var i = 0; i < childDiagrams.length; i++) {
						var refElement = newPackage.Elements.AddNew(names[i] + " Reference", "UMLDiagram");
						refElement.Name = names[i];
						refElement.Stereotype = "p1Profile::UMLDiagram";
						refElement.SynchTaggedValues("p1Profile","UMLDiagram");
						refElement.Update();
						var executeString = ("update t_object set pdata1 = " + childDiagrams[i].DiagramID + " where ea_guid =" + refElement.ElementGUID);
						Repository.Execute(executeString);
						diagramReferences[i] = refElement;
		 }
		 
		 // add trace connectors
		 for (var i = 0; i < diagramReferences.length; i++) {
						var newConnector as EA.Connector;
						newConnector = element.Connectors.AddNew('','Dependency');
						newConnector.Stereotype = 'EAUML::trace';
						newConnector.ClientID = element.ElementID;
						newConnector.SupplierID = diagramReferences[i].ElementID;
						newConnector.Update();
		 }
		 
		 // add element and diagram references to trace picture
		 var diagObjects as EA.Collection;
		 diagObjects = tracePicture.DiagramObjects;
		 var elementArray = [diagramNote, element].concat(diagramReferences);
		 var position = 'l=100;r=100;t=100;b=100;';
		for (i = 0; i < elementArray.length; i++) {
						var newObject as EA.DiagramObject;
						newObject = diagObjects.AddNew(position,'');
						newObject.ElementID = elementArray[i].ElementID;
						newObject.Update();
		 }
		 // layout 
		 Repository.GetProjectInterface().LayoutDiagramEx(tracePicture.DiagramGUID,lsLayeringOptimalLinkLength,1,20,20,false)
		 tracePicture.Update()
	  }
   }
   else
   {
	  Session.Prompt( "This script requires a diagram to be visible.", promptOK)
   }
}

OnDiagramScript();


















