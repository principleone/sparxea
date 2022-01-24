!INC Local Scripts.EAConstants-JScript
!INC P1Core.P1Core
/*
 * Script Name: 
 * Author: 
 * Purpose: stuff for delivery model
 * Date: 
 */
 
 
/**
 * Add new workstream element, associated view and model packages, and composition connector to specified delivery element 
 * @param {string} wsName - name of the new workstream
 * @param {EA.Element} deliveryElement - associated delivery element
 */
function addWorkstream(wsName,deliveryElement)
{
	var delElement as EA.Element;
	var delMdlRootPackage as EA.Package;
	var delVwRootPackage as EA.Package;

	var wsMdlRootPackage as EA.Package;
	var wsVwRootPckg as EA.Package;
	
	var newWS as EA.Element;
	
	delElement = deliveryElement;
	// find the place to add the actual Workstream object itself.
	delMdlRootPackage = Repository.GetPackageByGuid(p1GetTv(delElement,("p1.ModelStructure.ModelAbstraction")).Value);
	delVwRootPackage = Repository.GetPackageByGuid(p1GetTv(delElement,("p1.ModelStructure.ViewAbstraction")).Value);
	// access child locations by convention
	wsMdlRootPackage = delMdlRootPackage.Packages.GetByName("Workstreams");
	wsVwRootPckg = delVwRootPackage.Packages.GetByName("Workstreams");
		
	
	if(wsMdlRootPackage && wsVwRootPckg)
	{
		var newWSViewPackage as EA.Package;
		var newWSModelPackage as EA.Package;
		var newWSVPtag as EA.TaggedValue;
		var newWSMPtag as EA.TaggedValue;
		var newConnector as EA.Connector;
		
		
		// create the element itself, be careful addnew is case sensitive for types
		newWS = wsMdlRootPackage.Elements.AddNew(wsName,"p1profile::Workstream");
		newWS.Update();
		newWS.SynchTaggedValues("p1profile","Workstream");
		
		newWSVPtag = p1GetTv(newWS,"p1.ModelStructure.ViewAbstraction");
		newWSMPtag = p1GetTv(newWS,"p1.ModelStructure.ModelAbstraction");
		
		// add the associated view and model packages to hold the various diagrams etc
		newWSViewPackage = wsVwRootPckg.Packages.AddNew(wsName,"");
		newWSViewPackage.Update();
		newWSViewPackage.Element.Stereotype ="ViewPkg";
		newWSViewPackage.Element.Update();
		
		newWSModelPackage = wsMdlRootPackage.Packages.AddNew(wsName,"");
		newWSModelPackage.Update();
		newWSModelPackage.Element.Stereotype ="ModelPkg";
		newWSModelPackage.Element.Update();
		
		// set the tagged value for the new SS Element, so that we have a link to the view package
		newWSVPtag.Value = newWSViewPackage.PackageGUID;
		newWSVPtag.Update();
		newWSMPtag.Value = newWSModelPackage.PackageGUID;
		newWSMPtag.Update();
		
		//add composition connector
		newConnector = delElement.Connectors.AddNew('','Composition');
		newConnector.ClientID = newWS.ElementID;
		newConnector.SupplierID = delElement.ElementID;
		newConnector.Update();
		
		//create package structures in folders.
		addWorkstreamPkgs(newWSModelPackage);
		
	}
	else
	{
		Session.Output("system tagged values unresolved");
	}
	
}


/**
 * Add primary work package element, associated view and model packages, and composition connector to parent delivery element
 * @param {string} wsName - name of new primary work package
 * @param {EA.Element} parentDelElement - parent delivery element
 * @param {string} WPSubtype - work package subtype
 */
function addPrimaryWP(wsName,parentDelElement,WPSubtype)
{
	var delElement as EA.Element;
	var delMdlRootPackage as EA.Package;
	var delVwRootPackage as EA.Package;

	var wsMdlRootPackage as EA.Package;
	var wsVwRootPckg as EA.Package;
	
	var newWS as EA.Element;
	
	delElement = parentDelElement;
	//get the basic info from the parent
	//and work towards finding the right target location
	delMdlRootPackage = Repository.GetPackageByGuid(p1GetTv(delElement,("p1.ModelStructure.ModelAbstraction")).Value);
	delVwRootPackage = Repository.GetPackageByGuid(p1GetTv(delElement,("p1.ModelStructure.ViewAbstraction")).Value);
	//we then need to go up two levels.
	delMdlRootPackage = Repository.GetPackageByID(delMdlRootPackage.ParentID);
	delMdlRootPackage = Repository.GetPackageByID(delMdlRootPackage.ParentID);
	delVwRootPackage = Repository.GetPackageByID(delVwRootPackage.ParentID);
	delVwRootPackage = Repository.GetPackageByID(delVwRootPackage.ParentID);
	//access child locations by convention
	//this could be replaced with a case statement easily enough to support the general situation
	wsMdlRootPackage = delMdlRootPackage.Packages.GetByName("Primary");
	wsVwRootPckg = delVwRootPackage.Packages.GetByName("Primary");
		
	
	if(wsMdlRootPackage && wsVwRootPckg)
	{
		var newWSViewPackage as EA.Package;
		var newWSModelPackage as EA.Package;
		var newWSVPtag as EA.TaggedValue;
		var newWSMPtag as EA.TaggedValue;
		var newConnector as EA.Connector;
		
		//todo parameterise by type
		
		//create the element itself, be careful addnew is case sensitive for types
		newWS = wsMdlRootPackage.Elements.AddNew(wsName,"p1profile::PrimaryWorkPackage");
		newWS.Update();
		newWS.SynchTaggedValues("p1profile","PrimaryWorkPackage");
		
		newWSVPtag = p1GetTv(newWS,"p1.ModelStructure.ViewAbstraction");
		newWSMPtag = p1GetTv(newWS,"p1.ModelStructure.ModelAbstraction");
		
		//add the associated view and model packages to hold the various diagrams etc
		newWSViewPackage = wsVwRootPckg.Packages.AddNew(wsName,"");
		newWSViewPackage.Update();
		newWSViewPackage.Element.Stereotype ="ViewPkg";
		newWSViewPackage.Element.Update();
		
		newWSModelPackage = wsMdlRootPackage.Packages.AddNew(wsName,"");
		newWSModelPackage.Update();
		newWSModelPackage.Element.Stereotype ="ModelPkg";
		newWSModelPackage.Element.Update();
		
		//set the tagged value for the new SS Element, so that we have a link to the view package
		newWSVPtag.Value = newWSViewPackage.PackageGUID;
		newWSVPtag.Update();
		newWSMPtag.Value = newWSModelPackage.PackageGUID;
		newWSMPtag.Update();
		
		//add composition connector
		newConnector = delElement.Connectors.AddNew('','Composition');
		newConnector.ClientID = newWS.ElementID;
		newConnector.SupplierID = delElement.ElementID;
		newConnector.Update();
		
		//create package structures in folders.
		addWorkstreamPkgs(newWSModelPackage);
		
	}
	else
	{
		Session.Output("system tagged values unresolved");
	}
}


/**
 * Add motivation package to a given root
 * @param {EA.Package} rootPkg - root package
 */
function addWorkstreamPkgs(rootPkg)
{
	//adds common p1 structure packages to a given root
	var root as EA.Package;
	var pkgTemp = EA.Package;
	root = rootPkg;
	pkgTemp = addp1Package("Motivation","Motivation",root,1,"MotivPkg");
	//add child packages
	root.Packages.Refresh();
	
}