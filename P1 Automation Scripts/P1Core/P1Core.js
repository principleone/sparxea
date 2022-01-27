!INC Local Scripts.EAConstants-JScript
/*
 * Script Name: 
 * Author: 
 * Purpose: 
 * Date: 
 */
 
 
/**
 * Get the Architecture Model and Architecture Views packages, and the SubSystem package in each of those
 * @param {string} rootGuid - unused
 */
function getPackages(rootGuid)
{
	// object to store packages
	var rootPackages = {
		arcModelPkg: null,
		arcViewPkg : null,
		tracePkg: null, // left blank
		ssVwRoot:null,
		ssMdlRoot:null,		
		ssPkgMap: new Map() // left blank
	};
	
	// search EA for control object - an element called 'p1ControlInfo'
	var coll as EA.Collection;
	var conObj as EA.Element;
	coll = Repository.GetElementsByQuery('Simple','p1ControlInfo');
	
	// if control object is found
	if (coll.Count ==1)
	{
		// retrieve element from collection
		conObj = coll.GetAt(0);
		
		// get packages using tagged values of control object
		rootPackages.arcModelPkg = Repository.GetPackageByGuid((p1GetTv(conObj,"p1Profile::p1.Control.ArcModelRoot")).Value);
		rootPackages.arcViewPkg = GetPackageByGuid((p1GetTv(conObj,"p1Profile::p1.Control.ArcViewRoot")).Value);	
		rootPackages.ssVwRoot = GetPackageByGuid((p1GetTv(conObj,"p1Profile::p1.Control.SSViewRoot")).Value);
		rootPackages.ssMdlRoot = GetPackageByGuid((p1GetTv(conObj,"p1Profile::p1.Control.SSModelRoot")).Value);	
		Session.Output("loaded packages");
	
		return rootPackages;
	}
	else 
	{
		Session.Output("Unable to find control Object");
		return null;
	}		
}
 
 
/**
 * Check whether an element is a system
 * @param {EA.Element} element - the element in question
 */
function isSystem(element)
{
	var el as EA.Element;
	el = element;
	
	// if the element has type Component and stereotype System
	if(el.Stereotype=="System" && el.Type=="Component") 
	{
		return true;
	}
	return false;
}


/**
 * Check whether an element is a subsystem
 * @param {EA.Element} element - the element in question
 */
function isSubSystem(element)
{
	var el as EA.Element;
	el = element;
	
	// if the element has type Component and stereotype Subsystem
	if(el.Stereotype=="Subsystem" && el.Type=="Component") 
	{
		return true;
	}
	return false;
}


/**
 * Create new package with specified name, alias, location and stereotype
 * @param {string} name - name of the new package
 * @param {string} itemAlias - alias of the new package
 * @param {string} parentPkg - location of the new package
 * @param {string} treepos - unused
 * @param {string} stereo - stereotype of the new package
 */
function addp1Package(name,itemAlias,parentPkg,treepos,stereo)
{
	// get packages within the parent package
	var parentPackages as EA.Collection;
	parentPackages = parentPkg.Packages;
	
	// add new package with specified name and alias
	pkg = parentPackages.AddNew( name, "" );
	pkg.Update();
	pkg.Alias = itemAlias;
	
	// set stereotype if specified
	if(stereo)
	{
		pkg.Element.Stereotype =stereo;
	}
	pkg.Update();
	
	return pkg;
}


/**
 * Get a particular tagged value object from an element
 * @param {EA.Element} obj - the element
 * @param {string} name - tagged value name
 */
function p1GetTv(obj,name)
{
	var el as EA.Element;
	var tv as EA.TaggedValue;
	if(obj)
	{
		// get element and loop over tagged values
		el = obj;
		for (var i = 0; i < el.TaggedValues.Count; i++) 
		{
			tv = el.TaggedValues.GetAt(i);
			// if a tagged value with specified name is found then return it's value
			if(tv.Name == name)
			{
			return tv;
			}
		}
	}
	Session.Output("tv lookup failed");
}


/**
 * Set a particular tagged value of an element
 * @param {EA.Element} obj - the element
 * @param {string} tagname - tagged value name
 * @param {string} newval - value to be assigned
 */
function p1SetTv(obj,tagname,newval)
{
	// get element and search for tagged value with specified name
	var el as EA.Element;
	var tv as EA.TaggedValue;
	tv = p1GetTv(obj,tagname);
	
	// if tagged value found assign the specified value to it
	if(tv)
	{
		tv.Value = newval;
		tv.Update();
		return true;
	}
	Session.Output("tv lookup failed");
}


/**
 * Check whether an element is one of P1's and return stereotype
 * @param {EA.Element} element - the element in question
 */
function getP1ElementType(element)
{
	// get element
	var el = EA.Element;
	el=element;
	
	// check the type
	switch (el.Type )
	{
		case "Component" :
		{
			// check the stereotype for a component
			switch (el.Stereotype)
			{
				case "System":
				{
					return "System";
				}
				case "Subsystem":
				{
					return "Subsystem";
				}
				case "ArcComponent":
				{
					return "ArcComponent";
				}			
				default:
				{
					return "notp1";
				}
			}
			break;
		}
		case "Class":
		{
			// check the stereotype for a class
			switch (el.Stereotype)
			{
				case "Delivery":
				{
					return "Delivery";
				}
				case "Workstream":
				{
					return "Workstream";
				}
				default:
				{
					return "notp1";
				}
			}
			break;			
		}
		// to do - add in something to deal with our various metadata classes eg. UMLDiagram, XXXSpace etc.
		default :
		{
			return "notp1";
		}
	}
}
 
/**
 * Set estimated volatility, uncertainty, complexity and ambiguity tagged values of an element to ‘Unknown’
 * @param {EA.Element} element - element to set tagged values of
 */
function setEstValuestoUnknown(el)
{
	p1SetTv(el,"p1.Est.Volatility","Unknown");
	p1SetTv(el,"p1.Est.Uncertainty","Unknown");
	p1SetTv(el,"p1.Est.Complexity","Unknown");
	p1SetTv(el,"p1.Est.Ambiguity","Unknown");
}


/**
 * Add a heatmap element with specified name and custom SQL in <memo> tagged value notes
 * @param {string} chartName - name of the new heatmap
 * @param {EA.Package} locationPkg - location of the new package
 * @param {string} customSQL - SQL script to be run
 */
function addHeatMap(chartName,locationPkg,customSQL)
{
	
	// should we consider adding a tv to point at the subject Element?
	var pkg = EA.Package;
	var newEl as EA.Element;
	pkg = locationPkg;
	
	// create new chart element
	newEl = pkg.Elements.AddNew(chartName,"Chart");
	newEl.Update();
	newEl.Type = "Class";
	newEl.Stereotype = "Chart";
	newEl.Update();
	// edit the tv
	newtv = p1GetTv(newEl,"ChartProperties");
	
	var chartContents;
	chartContents ="<chart type=\"TreeMap\">";
	chartContents += "<source customSQL=\"";
	chartContents += customSQL;
	chartContents +="\"/>";
	chartContents += "<appearance layout=\"0\" groupWidth=\"1\" gradient=\"0\" lightenSmallerNodes=\"1\">";
	chartContents += "<colorset valueType=\"1\"/>"
	chartContents += "</appearance>";
	chartContents += "</chart>";
		
	newtv.Notes = chartContents;
	newtv.Value = "<memo>";
	newtv.Update();
	newEl.Update();
	Session.Output("Added heatmap "+chartName);
	
}

/**
 * Add a new element to a diagram 
 * @param {EA.Diagram} diagram - diagram to add to 
 * @param {EA.Element} element - element to add
 * @param {string} position - optional position argument
 */
function p1AddToDiag(diagram,element,position)
{
	var theElement as EA.Element;
	var parentPkg as EA.Package;
	var diag as EA.Diagram;
	var diagramObjects as EA.Collection;
	var testDiagramObject as EA.DiagramObject;
	
	// get element, diagram and diagram objects
	theElement = element;
	diag = diagram;
	
	diagramObjects = diag.DiagramObjects;
	
	// set default position if none given
	if(!position)
	{
		position=  "l=200;r=400;t=200;b=600;";
	}
	
	// add the element to the diagram as a diagram object
	testDiagramObject = diagramObjects.AddNew(position, "" );
	testDiagramObject.ElementID = (theElement.ElementID);
	testDiagramObject.Update();
	
	Session.Output( "Added element '" + theElement.Name + "' to diagram '" + diag.Name + "'" );

}


/**
 * Get the coordinate values for the bottom and furthest right element edges on the diagram (aka 'size' of the diagram)
 * @param {EA.Diagram} diagram - diagram to get values from
 */
function getDiagMaxVals(diagram)
{
	var diag as EA.Diagram;
	var diagramObjects as EA.Collection;
	var dO as EA.DiagramObject;
	let diagVals =
	{
		bottom:0,
		right:0
	};
	
	// get diagram and its objects
	diag = diagram;
	diagramObjects = diag.DiagramObjects;
	
	// loop over diagram objects to find the max 'bottom' and 'right' values
	for ( var i = 0 ; i < diagramObjects.Count ; i++ )
		{
			dO = diagramObjects.GetAt(i);
			Session.Output(dO.bottom); // weirdly the bottom value is negative
			if(dO.bottom < diagVals.bottom)
			{
				diagVals.bottom = dO.bottom;
			}
			if(dO.right > diagVals.right)
			{
				diagVals.right = dO.right;
			}
			if(dO.bottom > diagVals.bottom)
			{
				diagVals.bottom = dO.bottom;
			}			
		}
	Session.Output(JSON.stringify(diagVals));
	return diagVals;
}


/**
 * Not sure
 * @param {EA.Element} element - not sure
 */
function getScopeObject(element)
{
	var el as EA.Element;
	var tgt as EA.Element;
	
	el = element;
	//gets the object linked by a scope tag
	//there are differnt tags for diagrams vs other stuff.
	p1GetTv(p1.Met.Scope)
	
	return 
}


/**
 * Add blank diagram (and diagram reference object) based on a specified element
 * @param {EA.Package} viewRoot - root view package to store diagram reference object
 * @param {EA.Element} linkedElement - element associated with new diagram
 * @param {EA.Package} diaglocationPackage - location of the new diagram
 * @param {string} diagName - name of the new diagram
 * @param {string} p1diagStereoType - stereotype of the new diagram
 */
function createDiagAndTraceElement(viewRoot,linkedElement,diaglocationPackage,diagName,p1diagStereoType)
{
	// the view root, in which we will create the diagramRef elements for later use
	var vwRt as EA.Package; 				
	// element we want to make the diagram about
	var linkedEl as EA.Element;				
	// the place we want to put the diagram itself
	var diaglocPkg as EA.Package;			
	// the created diagram Ref Element to add 
	var newDiagRefElement as EA.Element;	
	// the new diagram itself.
	var newDiag as EA.Diagram;	
	
	vwRt = viewRoot;
	linkedEl = linkedElement;
	diaglocPkg = diaglocationPackage;
	
	// create new blank diagram
	newDiag = diaglocPkg.Diagrams.AddNew(diagName + ' - '+ linkedEl.Name,p1diagStereoType);
	newDiag.Update();
	newDiag.Version="0.1";
	newDiag.ShowDetails=1;
	newDiag.Update();
	Session.Output("Added diagram: " + newDiag.Name + " v " + newDiag.Version);
	
	// create diagram reference element
	newDiagRefElement = vwRt.Elements.AddNew(newDiag.Name, "UMLDiagram");
	newDiagRefElement.Update();
	newDiagRefElement.Stereotype = "p1Profile::UMLDiagram";
	newDiagRefElement.SynchTaggedValues("p1Profile","UMLDiagram");
	// set tagged values
	newDiagRefElement.Update();
	
	// set the scope, type and default maturity of diagram reference element
	var tempTv as EA.TaggedValue;
	tempTv = p1GetTv(newDiagRefElement,"p1.Dia.Scope");
	tempTv.Value = linkedEl.ElementGUID;
	tempTv.Update();
	tempTv = p1GetTv(newDiagRefElement,"p1.Dia.Type");
	tempTv.Value = p1diagStereoType.replace("p1 Diagrams v3::","");
	tempTv.Update();
	tempTv = p1GetTv(newDiagRefElement,"p1.Dia.Maturity");
	tempTv.Value = "VL";
	tempTv.Update();
	
	newDiagRefElement.Status="From Template";
	newDiagRefElement.Update();
	
	// not sure what this does - add connector maybe?
	var executeString = ("update t_object set pdata1 = " + newDiag.DiagramID + " where ea_guid ='" + newDiagRefElement.ElementGUID+"'");
	Repository.Execute(executeString);
	Session.Output("Added diagram Element: "+ newDiag.Name + " v "+newDiag.Version);

	return newDiag;
}


/**
 * Create blank decomp and boundary diagrams, trace picture and heatmap of a specified subsystem
 * @param {EA.Element} el - subsystem to create diagrams of
 */
function addTraceIndex(el)
{
	//this function should decode what the element is and know where to put the trace index, if not already set
	var element as EA.Element;
	var viewPkgTv as EA.TaggedValue;
	var basetv as EA.TaggedValue;
	var viewPckg as EA.Package;
	element = el;
	
	// find the view package from the tag on the element
	// it should in turn have a tag which links to the traceIndex
	switch ( element.Stereotype )
	{
		// if subsystem
		case "Subsystem" :
		{
			// get view package GUID from tv and view package
			viewPkgTv = p1GetTv(element,"p1.ModelStructure.ViewAbstraction");
			viewPckg = Repository.GetPackageByGuid(viewPkgTv.Value);
			
			let diagRefInfo = 
			{
				decomp:null,
				boundary:null,
				conceptual:null,
				motivationHow:null,
				motvationWhat:null
			};				
			
			// if view package found
			if(viewPckg)
			{
				// assumes that there is one per item, todo- add a tag to hold the reference for easier naviagation even if someone moves it.
				// create trace picture
                var tracePicture as EA.Diagram;
				var diagName = element.Name + ' Trace Index';
                tracePicture = viewPckg.Diagrams.AddNew(diagName, 'p1Profile::Trace' );
				tracePicture.Version = "0.1";
                tracePicture.Update();
				
				//add tag to parent object
				basetv = p1GetTv(element,"p1.ModelStructure.IndexView");
				basetv.Value = tracePicture.DiagramGUID;
				basetv.Update();
				
				//we know its a subsystem so create the necessary diagrams, note FQ profile alias for stereotype
				diagRefInfo.decomp = createDiagAndTraceElement(viewPckg,element,viewPckg.Packages.GetByName("Application Architecture"),"Subsystem Decomp","p1 Diagrams v3::Decomposition");
				//add the SummaryChart
				addSSHeatmap(element.Name,viewPckg.Packages.GetByName("Application Architecture"));
				
				diagRefInfo.boundary = createDiagAndTraceElement(viewPckg,element,viewPckg.Packages.GetByName("Boundary and Context"),"Subsystem Context","p1 Diagrams v3::System Context");
						
		
				// tracePicture.ShowDetails = 1; // properties without create/modified date
                // properties note
				//var diagramNote as EA.Element;
				//diagramNote = viewPckg.Elements.AddNew( "", "Text" );
				//diagramNote.Subtype = 18;
				//diagramNote.Update(); // added to the diagram later in loop. adding now causes blank diagram
				//tracePicture.Update();
				
				//add decomposition
				
				
			}
			else
			{
				Session.Output("no view package set for object");
			}
			
		}
		break;
	}
	
}