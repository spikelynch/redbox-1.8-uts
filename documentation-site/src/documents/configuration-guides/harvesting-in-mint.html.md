```
title: Harvesting data
layout: page
tags: ['intro','configGuide']
pageOrder: 2
```

A key feature of ReDBox and Mint is the ability to harvest records from external sources. This functionality is delivered by the [ReDBox Harvester tool](harvesterTool) and is capable of consuming data from a variety of sources (such as a relational database and message queue). The most common method used is to harvest CSV files from the file system. With the addition of the [Administration Interface](adminInterface) in ReDBox 1.8, the ability to submit the CSV files via a user interface or a REST API is also possible.

### Harvesting in Mint

The default configuration for the Mint harvester is to monitor a directory on the file system and to process the CSV files that are placed there.

####Business Rules

**CSV Format**

CSV files should adhere to the [RFC4180](http://tools.ietf.org/html/rfc4180) standard

**CSV Filename**

The harvester utilises the CSV filename to determine the type of record by the filename. For example, to harvest party records, the filename must be Party_People.csv. Any other filename will cause the harvester to fail as the record type will not be recognised. The filenames required or each record type is outlined below in the record details section.

**Adding and updating records**

The Mint harvester requires utilises an identifier column to identify whether a record already exists in storage and requires updating or is new and requires adding. As this is column is being used an identifier, there is a requirement that each record is unique. The field can be a string of any format though numeric identifiers are often used.

**Deleting a record**

You _**cannot**_ delete a record in Mint via the CSV harvest. This rule is implemented for the following reasons:
* In some situations, the data feed from the central system (source of truth) is not reliable and records go "missing". For example, the HR system or research management system may not publish information about staff that left.
* Mint often creates additional metadata as part of the curation model (see [Curating Linked Data](http://www.redboxresearchdata.com.au/documentation/system-overview/curating-linked-data)) and this would be lost if you delete the record. For example, the person has an NLA identifier and links to a ReDBox record
* There's a hidden benefit - your CSV file needs only contain records that require updating/inserting.

As Mint is in charge of publishing records to services (such as the National Libraries Australia and Research Data Australia), it isn't appropriate for these records to just disappear. Once they're in Mint they need to be treated with curatorial gloves.
It is however possible to delete a record via the Mint user interface by logging in as an administrator. This is of course strongly discouraged and you must make sure that you aren't breaking any relationships with other objects (in Mint or ReDBox) or feeds to other services.


####Record types

**Parties**

Parties data is used to record researcher information.

**Information:**
* **Filename** - Parties_People.csv
* **Demonstration** - http://demo.redboxresearchdata.com.au/mint/Parties_People/search
* **Sample data file** - [Parties_People.csv](https://qcifltd.atlassian.net/wiki/download/attachments/15433763/Parties_People.csv?version=1&modificationDate=1403146090062&api=v2)
* **See also ** - http://ands.org.au/guides/cpguide/cpgparty-bestpractice.html

**CSV Fields**

| Mandatory | Field name             | Description                                                                                                         | Example                                                 |
|-----------|------------------------|---------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| *         | ID                     | The institution's ID - likely to be a staff, student or researcher ID                                               | 00007429                                                |
| *         | Given_Name             | The first given name                                                                                                | Michael                                                 |
|           | Other_Names            | Any intermediary (middle) names                                                                                     | Alfred                                                  |
|           | Family_Name            | Often referred to as surname                                                                                        | Jones                                                   |
|           | Pref_Name              | The preferred name, usually a single name                                                                           | Mick                                                    |
|           | Honorific              | A name prefix                                                                                                       | Mrs, Dr, Prof                                           |
|           | Email                  | The person's email address                                                                                          | mick@staff.edu.au                                       |
|           | Job_Title              | The primary job title for the person                                                                                | Facility Director                                       |
|           | GroupID_1              | Links to Party (Group) records. This needs to match an ID in the Parties-Group CSV                                  |                                                         |
|           | GroupID_2              |                                                                                                                     |                                                         |
|           | GroupID_3              |                                                                                                                     |                                                         |
|           | ANZSRC_FOR_1           | The 2, 4 or 6 digit Field of Research code as designated by the Australian Bureau of Statistics under ANZSRC (2008) | 04, 0101, 070201                                        |
|           | ANZSRC_FOR_2           |                                                                                                                     |                                                         |
|           | ANZSRC_FOR_3           |                                                                                                                     |                                                         |
|           | NLA_Party_Identifier   | A National Library of Australia party identifier                                                                    | http://nla.gov.au/nla.party-461793                      |
|           | ResearcherID           | A Thomson Reuters ID created using the http://www.researchid.com service                                            | http://www.researcherid.com/rid/F-3500-2011             |
|           | Personal_Homepage      | The researcher's personal website                                                                                   | http://www.me.example.com/                              |
|           | Staff_Profile_Homepage | The researcher's webpage within the institutional web presence                                                      | http://staffprofiles.edu.au/mjones                      |
|           | Description            | A brief bio or overview of the researcher                                                                           | Mike has been investigating the effects of loud noises. |

**Groups**

Groups are any organisational unit that relates to research. This could be formal groups such as faculties or informal such as an arts collective.
Typically, this data is provided in a hierarchical model. For example, the University is named as the top-level group with faculties and institutes below and then schools below them:
![](../../images/harvesting/Sample Parties-Groups org chart.png)

**Information:**
* **Filename** - Parties_Groups.csv
* **Demonstration** - http://demo.redboxresearchdata.com.au/mint/Parties_Groups/search
* **Sample data file** - [Parties_Groups.csv](https://qcifltd.atlassian.net/wiki/download/attachments/15433763/Parties_Groups.csv?version=1&modificationDate=1403146163400&api=v2)
* **See also ** - http://ands.org.au/guides/cpguide/cpgparty-bestpractice.html

**CSV Fields**

| Mandatory | Field name      | Description                             | Note                     | Examples                   |
|-----------|-----------------|-----------------------------------------|--------------------------|----------------------------|
| *         | ID              | An identifier for the group	                                  | This is linked to via the GroupID_1 field in the Party data or the Parent_Group_ID field in the Groups data                   | FoS                     |
| *         | Name            | The name of the group                   |                          | Faculty of Science         |
|           | Email           | A contact email address for the group   |                          | fos@uni.edu.au             |
|           | Phone           | A phone number for contacting the group |                          | 07 3456 7654               |
|           | Parent_Group_ID |                                         | Link to the parent group | UoE                        |
|           | Homepage        | The group's website                     |                          | http://www.fos.uni.edu.au/ |
|           | Description     | A brief description of the group        |                          |                            |

**Activities**

Activities data is used to record research activities that are not funded via the ARC or the NHMRC.

**Information:**
* **Filename** - Activities.csv
* **Demonstration** - http://demo.redboxresearchdata.com.au/mint/Activities/search
* **Sample data file** - [Activities.csv](https://qcifltd.atlassian.net/wiki/download/attachments/15433763/Activities.csv?version=1&modificationDate=1403146198355&api=v2)
* **See also ** - http://ands.org.au/guides/cpguide/cpgparty-bestpractice.html

**CSV Fields**

| Mandatory | Field name              | Description                                                                                                                                   |
|-----------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| *         | ID                      | An identifier for the activity                                                                                                                |
|           | Title                   | The title of the activity                                                                                                                     |
|           | Name                    | The name of the activity                                                                                                                      |
|           | Type                    | The type of activity as described by the  [ANDS Content Providers Guide](http://ands.org.au/guides/cpguide/cpgactivity.html#sourcing)         |
|           | Existence_Start         | The year in which the activity started                                                                                                        |
|           | Existence_End           | The year in which the activity completed                                                                                                      |
|           | Description             | A description of the activity                                                                                                                 |
|           | Primary_Investigator_ID | The ID of the PI (links to the Parties-People data)                                                                                           |
|           | Investigators           | A semi-colon (;) separated list of IDs for other researchers related to the activity. These IDs must match records in the Parties-People data |
|           | Website                 | A website for the activity                                                                                                                    |
|           | ANZSRC_FOR_1            | The 2, 4 or 6 digit Field of Research code as designated by the Australian Bureau of Statistics under ANZSRC (2008)                           |
|           | ANZSRC_FOR_2            |                                                                                                                                               |
|           | ANZSRC_FOR_3            |                                                                                                                                               |



####Pre-loaded data

As well as the following data sets that contain institution specific there are other vocabularies that Mint stores. These are either:
* Standard vocabularies used by the ReDBox to enhance it's forms (e.g. language codes)
* National standardised data that is relevant for all Australian institutions (e.g. ARC and NHMRC grant data)

The complete list of data pre-loaded is as follows:
1. ANZSRC FOR and SEO codes
2. Language codes
3. Geo-spatial information (used by the map widget)
4. MARC Country codes
6. ARC and NHMRC Grant data
