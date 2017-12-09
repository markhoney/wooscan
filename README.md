Woo Scan
========

A project contains one or more searches
A search has a list of relevant terms, a list of extra terms (that aren't highlighted in the text) and some modifiers (online shop terms, NZ sites only restriction, etc)
A search brings up pages as results. These pages are saved to a DB (url, title, google's sample text, date/time), and can be marked as irrelevant or opened for further checking.
Each result also needs to be marked as relevant to either a search or a project - presumably a list in the search/project object will hold these.
If a page is opened for further checking, the whole page is downloaded and added to the page's DB entry (text, date/time).
Words or phrases can be highlighted, and these will be saved to an issues table in the DB, along with date/time of creation. (An immediate search can be performed to ensure )
When a re-scan button is pressed, a check is first performed to see if the page has changed (date/time, size, etc). If a change has occurred, the new text will be saved to the pages table.
The keywords will be checked, to see if they've changed. If there is a change, a manual check will need to be performed to see if the page is still an issue.
At this point, the page should be shown with a diff.
If there are keyword changes but still infringement, new keywords will need to be saved. The old issue would be closed with a date/time and a new one opened.




Tables
- Projects
	- Name
	- Google Search
	- DateTime
- Pages
	- URL
	- DateTime
	- Response Code
	- Text
	- Screenshot?
	- Size
	-
- Checks
	- Project
	- Page
	- DateTime
	- Match


Tabs
- Projects
- Pages
- Issues
