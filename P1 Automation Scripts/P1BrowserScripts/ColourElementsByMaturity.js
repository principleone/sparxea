!INC Local Scripts.EAConstants-JScript


function ColourElementsByMaturity()
{
	// if diagram is selected
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	if (treeSelectedType == otDiagram) 
	{
		// get all diagram objects
		var diagram as EA.Diagram;
		diagram = Repository.GetTreeSelectedObject();
		var diagObjects as EA.Collection;
		diagObjects = diagram.DiagramObjects;
		
		// for each object
		for (var i = 0; i < diagObjects.Count; i++) 
		{
			// get element and tags
		    var diagObject as EA.DiagramObject;
		    diagObject = diagObjects.GetAt(i);
		    element = Repository.GetElementByID(diagObject.ElementID);
		    tags = element.TaggedValues;
		   
		    // check for maturity tag
		    var maturityTagInd = false;
		    for (var j = 0; j < tags.Count; j++) 
		    {
				tag = tags.GetAt(j);
				if (tag.Name == 'p1.Dia.Maturity') 
				{
					maturityTagInd = true;
				}
		    }
	   
			// colour based on maturity
			if (maturityTagInd == true) 
			{
				var maturityTag = tags.GetByName('p1.Dia.Maturity');
				switch(maturityTag.Value) 
					{
						 case 'VL':
								diagObject.Style = 'BCol=13092863';
								break;
						 case 'L':
								diagObject.Style = 'BCol=12575487';
								break;
						 case 'M':
								diagObject.Style = 'BCol=14220030';
								break;
						 case 'H':
								diagObject.Style = 'BCol=13303531';
								break;
						 case 'VH':
								diagObject.Style = 'BCol=13696672';
								break;
					  }
				diagObject.Update()
			}
		}
		diagram.Update();
		Repository.ReloadDiagram(diagram.DiagramID);
	}              
	else 
	{
		Session.Prompt( "This script does not support items of this type." , promptOK );
	}      
}

ColourElementsByMaturity();