!INC Local Scripts.EAConstants-JScript
!INC P1Core.P1Core

/*
 * Script Name: Solution Model
 * Author: Al
 * Purpose: Collection of methods for adding stuff to do with the solution model
 * Date: 
 */
 
 
/**
 * Add common p1 subsystem packages to a given root
 * @param {EA.Package} rootPkg - root package
 */
 function addSubSystemPkgs(rootPkg)
{
	var root as EA.Package;
	root = rootPkg;
	addp1Package("Boundary and Context","Boundary",root,1,"BoundaryPkg");
	addp1Package("Motivation","Motivation",root,2,"MotivPkg");
	addp1Package("Information","Information",root,3,"InfoPkg");
	addp1Package("Application Architecture","Application Architecture",root,4,"AppPkg");
	addp1Package("Behaviour","Behaviour",root,5,"BehPkg");
	root.Packages.Refresh();
}


/**
 * Add common p1 system packages to a given root
 * @param {EA.Package} rootPkg - root package
 */
function addSystemPkgs(rootPkg)
{
	var root as EA.Package;
	root = rootPkg;
	addSubSystemPkgs(rootPkg);
	addp1Package("Subsystems","SubSystem",root,5);
	root.Packages.Refresh();
}


/**
 * Add subsystem element, associated packages, aggregation connector to parent system, and 
 * add all components to trace diagram if cmpList argument is given
 * @param {string} ssName - name of new subsystem
 * @param {EA.Element} systemElement - associated system element
 * @param {string} cmpList - comma separated list of components of the subsystem
 */
function addSubSystem(ssName,systemElement,cmpList)
{
	var sysElement as EA.Element;
	var systemSSPackage as EA.Package;
	var newSS as EA.Element;
	var cmpArr;
	
	// split component list into array
	if(cmpList)
	{
		cmpArr = cmpList.split(",");
	}
	
	sysElement = systemElement;
	
	// find the right package to add the subsystem element
	var ssPackageGUID = p1GetTv(sysElement,'p1.ModelStructure.ModelAbstraction').Value;
	systemSSPackage = Repository.GetPackageByGuid(ssPackageGUID);
	
	if(systemSSPackage)
	{
		var newSSViewPackage as EA.Package;
		var newSSModelPacakge as EA.Package;
		var newSSVPtag as EA.TaggedValue;
		var newSSMPtag as EA.TaggedValue;
		var rootPackages = getPackages();
		var newConnector as EA.Connector;
		
		// create the element itself, be careful addnew is case sensitive for types
		newSS = systemSSPackage.Elements.AddNew(ssName,"p1profile::Subsystem");
		newSS.Update();
		newSS.SynchTaggedValues("p1profile","Subsystem");
		
		newSSVPtag = p1GetTv(newSS,"p1.ModelStructure.ViewAbstraction");
		newSSMPtag = p1GetTv(newSS,"p1.ModelStructure.ModelAbstraction");
		
				
		// add the associated view and model packages to hold the various diagrams etc.
		newSSViewPackage = rootPackages.ssVwRoot.Packages.AddNew(ssName,"");
		newSSViewPackage.Update();
		newSSViewPackage.Element.Stereotype ="ViewPkg";
		newSSViewPackage.Element.Update();
		
		newSSModelPackage = rootPackages.ssMdlRoot.Packages.AddNew(ssName,"");
		newSSModelPackage.Update();
		newSSModelPackage.Element.Stereotype ="ModelPkg";
		newSSModelPackage.Element.Update();
		
		// set the tagged value for the new SS Element, so that we have a link to the view/model packages
		newSSVPtag.Value = newSSViewPackage.PackageGUID;
		newSSVPtag.Update();
		newSSMPtag.Value = newSSModelPackage.PackageGUID;
		newSSMPtag.Update();
		
		//add aggregation connector to system object	
		newConnector = sysElement.Connectors.AddNew('','Aggregation');
		newConnector.ClientID = newSS.ElementID;
		newConnector.SupplierID = sysElement.ElementID;
		newConnector.Direction = "unspecified";
		newConnector.Update();
		
		//create package structures in folders.
		addSubSystemPkgs(newSSViewPackage);
		addSubSystemPkgs(newSSModelPackage);
		
		// add trace index
		addTraceIndex(newSS);
		if(cmpArr)
		{
			var size = cmpArr.length;
			for (var i = 0; i<size; i++) 
			{
				Session.Output("Adding Component "+i+" "+ cmpArr[i]);
				addComponent(cmpArr[i],newSS);
			}
			// add components so that they can be included in the diagrams
		}
		scaffoldDiagrams(newSS);		
	
		return newSS;
	}
	else
	{
		Session.Output("system tagged values unresolved");
	}
}


/**
 * Add a new system and associated packages
 * @param {string} sysName - name of new system
 */
function addSystem(sysName)
{
	var entMdlPkg as EA.Package;
	var entVwPkg as EA.Package;
	
	// get enterprise view and model packages
	var rootPackages = getPackages();
	entMdlPkg = rootPackages.arcModelPkg.Packages.GetByName("Enterprise");
	entMdlPkg = entMdlPkg.Packages.GetByName("Application Architecture");
	entVwPkg = rootPackages.arcViewPkg.Packages.GetByName("System");
	
	if(entVwPkg && entMdlPkg)
	{
		var newSysViewPackage as EA.Package;
		var newSysModelPacakge as EA.Package;
		var newSysVPtag as EA.TaggedValue;
		var newSysMPtag as EA.TaggedValue;
		var newConnector as EA.Connector;
		
		// create the element itself, be careful addnew is case sensitive for types
		newSys = entMdlPkg.Elements.AddNew(sysName,"p1profile::System");
		Session.Output("Added new System: "+sysName);	
		newSys.Update();
		newSys.SynchTaggedValues("p1profile","System");
		
		newSysVPtag = p1GetTv(newSys,"p1.ModelStructure.ViewAbstraction");
		newSysMPtag = p1GetTv(newSys,"p1.ModelStructure.ModelAbstraction");	
				
		// add the associated view and model packages to hold the various diagrams etc.
		newSysViewPackage = entVwPkg.Packages.AddNew(sysName,"");
		newSysViewPackage.Update();
		newSysViewPackage.Element.Stereotype ="ViewPkg";
		newSysViewPackage.Element.Update();
		
		// now find place to put child ojects
		entMdlPkg = rootPackages.arcModelPkg.Packages.GetByName("System");
		newSysModelPacakge = entMdlPkg.Packages.AddNew(sysName,"");
		newSysModelPacakge.Update();
		newSysModelPacakge.Element.Stereotype ="ModelPkg";
		newSysModelPacakge.Element.Update();
		
		//set the tagged value for the new SS Element, so that we have a link to the view package
		newSysVPtag.Value = newSysModelPacakge.PackageGUID;
		newSysVPtag.Update();
		newSysMPtag.Value = newSysModelPacakge.PackageGUID;
		newSysMPtag.Update();
		
		//create package structures in folders, this is a bit of a hack for now
		addSystemPkgs(newSysViewPackage);
		addSystemPkgs(newSysModelPacakge);
	
		scaffoldDiagrams(newSys);		
	
		return newSys;
	}
	else
	{
		Session.Output("system tagged values unresolved");
	}
	
}


/**
 * Add a new component and aggregation connector to subsystem
 * @param {string} cmpName - name of new component
 * @param {EA.Element} ssElem - associated subsystem element
 */
function addComponent(cmpName,ssElem)
{
	//add the item in the right place
	var ssElement as EA.Element;
	var systemSSPackage as EA.Package;
	var newCmp as EA.Element;
	
	ssElement = ssElem;
	//find the place to add the Component object itself.
	ssPackageGUID = p1GetTv(ssElement,"p1.ModelStructure.ModelAbstraction").Value;
	systemSSPackage = Repository.GetPackageByGuid(ssPackageGUID);
	//that gets you the root, now find the Application Architecture folder
	systemSSPackage = systemSSPackage.Packages.GetByName("Application Architecture");
	
	if(systemSSPackage && cmpName)
	{
		var newConnector as EA.Connector;
		
		//create the element itself, be careful addnew is case sensitive for types
		newCmp = systemSSPackage.Elements.AddNew(cmpName,"p1profile::ArcComponent");
		newCmp.Update();
		newCmp.SynchTaggedValues("p1profile","ArcComponent");
		setEstValuestoUnknown(newCmp);
		
		
		
		//add aggregation connector to subsystem object
		
		newConnector = ssElement.Connectors.AddNew('','Aggregation');
		newConnector.ClientID = newCmp.ElementID;
		newConnector.SupplierID = ssElement.ElementID;
		newConnector.Update();
		
		return newCmp;
	}
	else
	{
		Session.Output("error");
	}
	
}


/**
 * Add a heatmap of a specified subsystem
 * @param {string} ssName - name of subsystem
 * @param {EA.Package} locationPkg - intended package for heatmap
 */
function addSSHeatmap(ssName,locationPkg)
{
	//should we consider adding a tv to point at the subject Element?
	var customSQL;
	customSQL ="select est.Name as Series ,est.total as ChartValue,ss.SubsystemName as GroupName&#xA;";
	customSQL += "from p1_Est_Tag est&#xA;join p1_SStoArcCmp ss&#xA;on est.Object_id = ss.cmpID&#xA;"
	customSQL += "where ss.SubsystemName =&quot;"
	customSQL += ssName;
	customSQL +="&quot;;";
	addHeatMap(ssName+" Components",locationPkg,customSQL)

}


/**
 * Add blank decomp diagram and trace picture based on specified system or subsystem
 * @param {EA.Element} el - system or subsystem element
 */
function scaffoldDiagrams(el)
{
	var theElement as EA.Element;
	var viewPckg as EA.TaggedValue;
	theElement = el;
	p1Typ = getP1ElementType(theElement);
	viewPkgTv = p1GetTv(theElement,"p1.ModelStructure.ViewAbstraction");
	viewPckg = Repository.GetPackageByGuid(viewPkgTv.Value);
			
	switch (p1Typ)
	{
		case "System":
		{
			createDiagAndTraceElement(viewPckg,theElement,viewPckg.Packages.GetByName("Application Architecture"),"System Decomp","p1 Diagrams v3::Component Decomposition");
			createTraceDiag(viewPckg,theElement);	
			
			break;
		}
		case "Subsystem":
		{
			//add the main diagrams, trace is a bit special, we do that at the end
				
			createDiagAndTraceElement(viewPckg,theElement,viewPckg.Packages.GetByName("Application Architecture"),"Subsystem Decomp","p1 Diagrams v3::Component Decomposition");
			createTraceDiag(viewPckg,theElement);			
			
			break;
		}
		case "Pattern":
		{
			
			break;
		}
		case "notp1":
		{
			Session.Output("not a p1 type");
		}
		default:
		{
			Session.Output("type not found");
		}
	}
}


/**
 * Add blank trace picture based on specified element
 * @param {EA.Package} vwPkg - root view package to store diagram
 * @param {EA.Element} theEl - system or subsystem element
 */
function createTraceDiag(vwPckg,theEl)
{
	var tracePicture as EA.Diagram;
	var viewPckg as EA.Package;
	var tgtPckg as EA.Package;
	var theElement as EA.Element;
	viewPckg = vwPckg;
	theElement = theEl;
	tgtPckg = viewPckg.Packages.GetByName("Application Architecture");
	
	tracePicture = createDiagAndTraceElement(viewPckg,theElement,tgtPckg,"Subsystem Trace Index","p1 Diagrams v3::Trace");
		
	//add tag to parent object
	basetv = p1GetTv(theElement,"p1.ModelStructure.IndexView");
	basetv.Value = tracePicture.DiagramGUID;
	basetv.Update();
	
}


/**
 * Add decomp, boundary and trace diagrams and heatmap for subsystem?
 */
function tempSSthing()
{
	// creates a starter diagram for each of t
	
	// get view package for element
	var el as EA.Element;
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
	
	if(viewPckg)
	{
		// create trace picture and associated other diagrams
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
			
	}
	else
	{
		Session.Output("no view package set for object");
	}	
}


/**
 * Fill in a subsystem trace picture
 */
function buildSSDiagram(el,diag)
{
	//build up the diagram
	// tracePicture.ShowDetails = 1; // properties without create/modified date
	// properties note
	//var diagramNote as EA.Element;
	//diagramNote = viewPckg.Elements.AddNew( "", "Text" );
	//diagramNote.Subtype = 18;
	//diagramNote.Update(); // added to the diagram later in loop. adding now causes blank diagram
	//tracePicture.Update();
}


/**
 * Update a system or subsystem decomp diagram with any child elements not currently present
 * @param {EA.Element} el - system or subsystem element 
 * @param {EA.Diagram} diag - decomp diagram to be updated
 */
function updateDiagram(el,diag)
{
	var element as EA.Element;
	var diagram as EA.Diagram;
	element = el;
	diagram = diag;
	
	// get all child elements of system/subsystem
	var childElements = getChildElements(element);
	
	// get the GUIDs of all elements present in diagram
	var diagElements = getDiagElements(diagram);
	var diagElemGUIDs = getGUIDs(diagElements);
	
	// set left edge position for first new object in diagram
	var basePosition = 10;
	
	// loop over child elements
	var child as EA.Element;
	for (var i = 0; i < childElements.length; i++)
	{
		child = childElements[i];
		// if the child element is not present in the diagram
		if (!diagElemGUIDs.includes(child.ElementGUID))
		{	
			// add child element to diagram
			var pos = 'l='+String(basePosition)+';r='+String(basePosition+100)+';t=-20;b=-90;'
			p1AddToDiag(diagram,child,pos);
			// adjust base position for next component
			basePosition += 110;
		}
		
	}
	diagram.Update();
}


/**
 * Get array of all elements present in a diagram
 * @param {EA.Diagram} diag - diagram
 */
function getDiagElements(diag)
{
	var diagram as EA.Diagram;
	var diagObjects as EA.Collection;
	
	// get diagram objects
	diagram = diag;
	diagObjects = diagram.DiagramObjects;
	
	var dO as EA.DiagramObject;
	var dE as EA.Element;
	var diagElements = [];
	
	// loop over diagram object collection
	for (var i = 0; i < diagObjects.Count; i++) {
		// get element from diagram object and add to array
		dO = diagObjects.GetAt(i);
		dE = Repository.GetElementByID(dO.ElementID);
		diagElements.push(dE);
	}
	return diagElements;
}


/**
 * Get the guids of an array of EA elements
 * @param {array} elements - an array of elements
 */
function getGUIDs(elements)
{
	var elementGUIDs = [];
	var element as EA.Element;
	// loop over elements
	for (var i = 0; i < elements.length; i++)
	{
		// get element and add guid to array
		element = elements[i];
		elementGUIDs.push(element.ElementGUID);
	}
	return elementGUIDs;
}


/**
 * Get parent system of a subsystem
 * @param {EA.Element} ss - subsystem
 */
function getParentSystem(ss)
{
	var element as EA.Element;
	element = ss;
	
	if (element.Stereotype == 'Subsystem') 
	{
		var connectors as EA.Collection;
		var client as EA.Element;
		var connector as EA.Connector;
		var parentSys = [];
		
		// loop over connectors to subsystem
		connectors = element.Connectors;
		for (var i = 0; i < connectors.Count; i++) 
		{
			// get connector and client element
			connector = connectors.GetAt(i);
			client = Repository.GetElementByID(connector.ClientID);
			supplier = Repository.GetElementByID(connector.SupplierID);
			
			// check for aggregation connector with System as supplier
			if ((connector.MetaType == 'Aggregation' || connector.Type == 'Aggregation'))
			{
				// add supplier to array if it's a system ('incorrect' way round?)
				if (supplier.Stereotype == 'System') 
				{
					parentSys.push(supplier);
				}
				// add client to array if it's a system ('correct' way round?)
				else if (client.Stereotype == 'System')
				{
					parentSys.push(client);
				}
			}
		}
		
		switch (true)
		{
			case (parentSys.length == 0): {
				Session.Output('No parent systems found for '+element.Name);
			}
			case (parentSys.length == 1): {
				return parentSys[0];
			}
			case (parentSys.length > 1): {
				Session.Output('Multiple parent systems found for '+element.Name);
				return parentSys;
			}
		}
	}
}


/**
 * Get child elements of a system or subsystem
 * @param {EA.Element} el - system or subsystem element
 */
function getChildElements(el)
{
	var element as EA.Element;
	element = el;
	
	// set child stereotype based on element stereotype
	var childStereo = '';
	switch (element.Stereotype) {	
		case 'Subsystem':
			childStereo = 'ArcComponent'; // is ArcComponent the only stereotype we're interested in here?
			break;
		case 'System':
			childStereo = 'Subsystem';
			break;
		default:
			Session.Output('This function requires a system or subsystem as input.')
	}
	
	// collection of connectors to subsystem element
	var connectors as EA.Collection;
	connectors = element.Connectors;
	
	var supplier as EA.Element;
	var connector as EA.Connector;
	var childElements = [];
	
	// loop over connectors
	for (var i = 0; i < connectors.Count; i++) 
	{
		// get connector and supplier element
		connector = connectors.GetAt(i);
		supplier = Repository.GetElementByID(connector.SupplierID);
		client = Repository.GetElementByID(connector.ClientID);
		
		
		// check for aggregation connector
		if ((connector.MetaType == 'Aggregation' || connector.Type == 'Aggregation'))
		{
			// add supplier to array if it's a child element ('correct' way round?)
			if (supplier.Stereotype == childStereo) 
			{
				childElements.push(supplier);
			}
			// add client to array if it's a child element ('incorrect' way round?)
			else if (client.Stereotype == childStereo)
			{
				childElements.push(client);
			}
		}
	}
	return childElements
}