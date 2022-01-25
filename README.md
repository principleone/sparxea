# Sparx Enterprise Architect helpers

Useful scripts and our own profiles for custom notations and extensions.


# P1 Automation Scripts

Sparx EA Browser and Diagram scripts for automating certain tasks using P1 notation and structure (e.g. update a diagram or create package structures). 

### Loading and using automation scripts in EA
To load the scripts:

1. Pull this repository
2. Find P1AutomationScripts.xml in the ReferenceData folder (copy to a different location if you like)
3. Import the XML file into EA using the Import Reference Data option - this will load the automation scripts into EA

To run a browser script, right-click something in the EA browser tab, hover over Specialise, then Scripts, and select the browser script you want to run. Diagram scripts are run in a similar way by right-clicking in an open diagram.

You can view all scripts in the Scripts tab, which can be opened by navigating to Specialize > Tools > Scripting > Scripts.

### Contributing to this repository
To contribute to this repository, save any new JS scripts in the appropriate folders (P1Core, P1BrowserScripts, or P1DiagramScripts), use the Export Reference Data option in EA to save an XML file in the ReferenceData folder of your local repository.

Exporting reference data will include all new scripts you have created. Since these will be distributed, make sure to delete any scripts you do not wish to distribute before exporting reference data.
