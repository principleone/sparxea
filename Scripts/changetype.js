!INC Local Scripts.EAConstants-JScript
/*
 * 
 * Script Name: Change types
 * Author: CSpearing
 * Purpose:Migrate the selected elements (including traversal down the tree) to a new type. 
 * Date: 2020-10-06
 */
 function SetElementType( theElement /* : EA.Element */, type /* : String */, stereotype /* : string */) /* : void */
{
	if ( theElement != null && type.length > 0 && stereotype.length > 0)
	{
			
		Session.Output("Changing Type from " + theElement.Type + " to " + type);
		theElement.Type= type;
		Session.Output("Changing StereotypeEx from " + theElement.StereotypeEx + " to " + stereotype);
		theElement.StereotypeEx = stereotype;
		
		theElement.Update();
	}
	
	RecurseAndSetChildElementTypes(theElement)
}

function RecurseAndSetChildElementTypes(theElement)
{	
	if (theElement.Elements !== "undefined"){
		for (var e = 0; e < theElement.Elements.Count; e++){
			var theChildElement = theElement.Elements.GetAt(e);
			SetTypes(theChildElement);
		}
	}		
}
 
function SetTypes(theElement)
{
	Session.Output("starting")
	SetElementType(theElement, "Activity", "P1BuildLogic::TechnologyServiceVersion");
	
	
}

function RecurseAndSetTypes(thePackage)
{	
	if (thePackage.Elements !== "undefined"){
		for (var e = 0; e < thePackage.Elements.Count; e++){
			var theElement = thePackage.Elements.GetAt(e);
			SetTypes(theElement);
		}
	}	

	if (thePackage.Packages !== "undefined"){
		for (var p = 0; p < thePackage.Packages.Count; p++)		{
			RecurseAndSetTypes(thePackage.Packages.GetAt(p));
		}
	}
}
 
/* 
 * Project Browser Script main function
 */
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	Session.Output("starting")
	// Handling Code: Uncomment any types you wish this script to support
	// NOTE: You can toggle comments on multiple lines that are currently
	// selected with [CTRL]+[SHIFT]+[C].
	switch ( treeSelectedType )
	{
		case otElement :
		{
			// Code for when an element is selected
			var theElement as EA.Element;
			theElement = Repository.GetTreeSelectedObject();
			SetTypes(theElement);
			break;
		}
		case otPackage :
		{
			// Code for when a package is selected
			var thePackage as EA.Package;
			thePackage = Repository.GetTreeSelectedObject();
			RecurseAndSetTypes(thePackage);
			break;
		}
//		case otDiagram :
//		{
//			// Code for when a diagram is selected
//			var theDiagram as EA.Diagram;
//			theDiagram = Repository.GetTreeSelectedObject();
//			
//			break;
//		}
//		case otAttribute :
//		{
//			// Code for when an attribute is selected
//			var theAttribute as EA.Attribute;
//			theAttribute = Repository.GetTreeSelectedObject();
//			
//			break;
//		}
//		case otMethod :
//		{
//			// Code for when a method is selected
//			var theMethod as EA.Method;
//			theMethod = Repository.GetTreeSelectedObject();
//			
//			break;
//		}
		default:
		{
			// Error message
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

OnProjectBrowserScript();
