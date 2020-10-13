!INC Local Scripts.EAConstants-JScript

/*
 * This code has been included from the default Project Browser template.
 * If you wish to modify this template, it is located in the Config\Script Templates
 * directory of your EA install path.   
 * 
 * Script Name: Set P1 tagged values
 * Author: CSpearing
 * Purpose:setting p1 tagged values
 * Date: 2020-03-09
 */
 function TVSetElementTaggedValue( theElement /* : EA.Element */, taggedValueName /* : String */, taggedValueValue /* : variant */) /* : void */
{
	if ( theElement != null && taggedValueName.length > 0 )
	{
		var taggedValue as EA.TaggedValue;
		taggedValue = null;
	
		// If replace existing was specified then attempt to get a tagged value from the element
		// with the provided name			
		taggedValue = theElement.TaggedValues.GetByName( taggedValueName );
		
		if ( taggedValue == null )
		{
			taggedValue = theElement.TaggedValues.AddNew( taggedValueName, taggedValueValue );
			
			taggedValue.Update();
		}		
		
		//taggedValue.Update();
	}
	
	RecurseAndSetChildElementTVs(theElement)
}

function RecurseAndSetChildElementTVs(theElement)
{	
	if (theElement.Elements !== "undefined"){
		for (var e = 0; e < theElement.Elements.Count; e++){
			var theChildElement = theElement.Elements.GetAt(e);
			SetTVs(theChildElement);
		}
	}		
}
 
function SetTVs(theElement)
{
	TVSetElementTaggedValue(theElement, "P1.Ambiguity","H");
	TVSetElementTaggedValue(theElement, "P1.Complexity","H");
	TVSetElementTaggedValue(theElement, "P1.Maturity","L");
	TVSetElementTaggedValue(theElement, "P1.Priority","3");
	TVSetElementTaggedValue(theElement, "P1.Risk","L");
	TVSetElementTaggedValue(theElement, "P1.Size","0");
	
}

function RecurseAndSetTVs(thePackage)
{	
	if (thePackage.Elements !== "undefined"){
		for (var e = 0; e < thePackage.Elements.Count; e++){
		var theElement = thePackage.Elements.GetAt(e);
		SetTVs(theElement);
		}
	}	

	if (thePackage.Packages !== "undefined"){
		for (var p = 0; p < thePackage.Packages.Count; p++)
		{
			RecurseAndSetTVs(thePackage.Packages.GetAt(p));
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
			SetTVs(theElement);
			break;
		}
		case otPackage :
		{
			// Code for when a package is selected
			var thePackage as EA.Package;
			thePackage = Repository.GetTreeSelectedObject();
			RecurseAndSetTVs(thePackage);
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
