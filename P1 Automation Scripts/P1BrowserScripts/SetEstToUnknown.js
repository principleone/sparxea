!INC Local Scripts.EAConstants-JScript
!INC P1Core.P1Common
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	
	switch ( treeSelectedType )
	{
		case otElement :
		{
			// Code for when an element is selected
			var theElement as EA.Element;
			theElement = Repository.GetTreeSelectedObject();
			setEstValuestoUnknown(theElement)
			Session.Output("P1 complexity metadata set to unknown : " + theElement.Name);
			break;
		}
		case otPackage :
		{
			var el = EA.Element;
			var pkg = EA.Package;
			pkg = Repository.GetTreeSelectedPackage();
			EA.package.
			var elementEnumerator = new Enumerator( pkg.Elements );
			while ( !elementEnumerator.atEnd() )
			{
				var currentElement as EA.Element;
				currentElement = elementEnumerator.item();
				Session.Output("setting tags for :" + currentElement.Name);
				setEstValuestoUnknown(currentElement);
				elementEnumerator.moveNext();
			}
		}
		
		default:
		{
			// Error message
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

OnProjectBrowserScript();
